package ma.inpt.gestdoc.service;

import java.time.Year;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import ma.inpt.gestdoc.domain.ActionAudit;
import ma.inpt.gestdoc.domain.Document;
import ma.inpt.gestdoc.domain.NiveauConfidentialite;
import ma.inpt.gestdoc.domain.StatutDocument;
import ma.inpt.gestdoc.domain.TypeDocument;
import ma.inpt.gestdoc.domain.Utilisateur;
import ma.inpt.gestdoc.dto.DocumentDto;
import ma.inpt.gestdoc.dto.DocumentRequest;
import ma.inpt.gestdoc.dto.DocumentResume;
import ma.inpt.gestdoc.dto.DocumentUpdateRequest;
import ma.inpt.gestdoc.exception.BusinessRuleException;
import ma.inpt.gestdoc.exception.ResourceNotFoundException;
import ma.inpt.gestdoc.repository.DocumentRepository;
import ma.inpt.gestdoc.repository.UtilisateurRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ma.inpt.gestdoc.domain.Circuits;
import ma.inpt.gestdoc.repository.EtapeValidationRepository;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EtapeValidationRepository etapeRepository;
    private final AuditService auditService;

    public DocumentService(DocumentRepository documentRepository,
                           UtilisateurRepository utilisateurRepository,
                           EtapeValidationRepository etapeRepository,
                           AuditService auditService) {
        this.documentRepository = documentRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.etapeRepository = etapeRepository;
        this.auditService = auditService;
    }

    @Transactional
    public DocumentDto creer(String username, DocumentRequest request) {
        Utilisateur auteur = utilisateur(username);

        Document doc = new Document();
        // Référence provisoire (unique) : la vraie est construite avec l'identifiant généré
        doc.setReference("TMP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24));
        doc.setType(request.type());
        doc.setObjet(request.objet().trim());
        doc.setContenu(request.contenu());
        NiveauConfidentialite niveau = determinerNiveau(request.type(), request.niveau());
        verifierHabilitationProduction(auteur, niveau);
        doc.setNiveau(niveau);
        doc.setStatut(StatutDocument.BROUILLON);
        doc.setAuteur(auteur);
        doc.setServiceEmetteur(auteur.getService());

        doc = documentRepository.save(doc); // l'identifiant est maintenant connu
        doc.setReference(genererReference(doc));

        auditService.log(ActionAudit.CREATION, username, doc.getId(),
                "Création du brouillon " + doc.getReference());
        return DocumentDto.from(doc);
    }

    @Transactional(readOnly = true)
    public List<DocumentResume> mesDocuments(String username) {
        Utilisateur auteur = utilisateur(username);
        return documentRepository.findByAuteurOrderByDateModificationDesc(auteur).stream()
                .map(DocumentResume::from)
                .toList();
    }

    @Transactional
    public DocumentDto obtenir(String username, Long id) {
        Utilisateur utilisateur = utilisateur(username);
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));
        if (!peutConsulter(utilisateur, doc)) {
            auditService.log(ActionAudit.ACCES_REFUSE, username, id,
                    "Tentative d'accès à " + doc.getReference() + " (niveau " + doc.getNiveau()
                            + ", habilitation " + utilisateur.getHabilitation() + ")");
            throw new AccessDeniedException("Accès refusé");
        }
        auditService.log(ActionAudit.CONSULTATION, username, id,
                "Consultation de " + doc.getReference());
        return DocumentDto.from(doc);
    }

    @Transactional
    public DocumentDto modifier(String username, Long id, DocumentUpdateRequest request) {
        Document doc = chargerPourAuteur(username, id);
        if (doc.getStatut() != StatutDocument.BROUILLON && doc.getStatut() != StatutDocument.REJETE) {
            throw new BusinessRuleException("Seul un brouillon ou un document rejeté peut être modifié");
        }

        doc.setObjet(request.objet().trim());
        doc.setContenu(request.contenu());
        if (request.niveau() != null) {
            NiveauConfidentialite niveau = determinerNiveau(doc.getType(), request.niveau());
            verifierHabilitationProduction(utilisateur(username), niveau);
            doc.setNiveau(niveau);
        }
        doc.setStatut(StatutDocument.BROUILLON); // un document rejeté repasse en brouillon
        doc = documentRepository.saveAndFlush(doc);

        auditService.log(ActionAudit.MODIFICATION, username, id,
                "Modification de " + doc.getReference());
        return DocumentDto.from(doc);
    }

    @Transactional
    public void supprimer(String username, Long id) {
        Document doc = chargerPourAuteur(username, id);
        verifierBrouillon(doc, "supprimé");

        etapeRepository.deleteByDocument(doc);
        documentRepository.delete(doc);
        auditService.log(ActionAudit.SUPPRESSION, username, id,
                "Suppression du brouillon " + doc.getReference());
    }
    // ---------- règles et méthodes utilitaires ----------

    private Utilisateur utilisateur(String username) {
        return utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

        /** Charge le document, à condition que l'utilisateur en soit l'auteur ET habilité pour son niveau. */
    public Document chargerPourAuteur(String username, Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));
        if (!doc.getAuteur().getUsername().equals(username)) {
            auditService.log(ActionAudit.ACCES_REFUSE, username, id,
                    "Tentative d'accès à " + doc.getReference());
            throw new AccessDeniedException("Accès refusé");
        }
        if (!doc.getAuteur().estHabilitePour(doc.getNiveau())) {
            auditService.log(ActionAudit.ACCES_REFUSE, username, id,
                    "Habilitation insuffisante pour " + doc.getReference() + " (niveau " + doc.getNiveau() + ")");
            throw new AccessDeniedException("Accès refusé");
        }
        return doc;
    }
        /**
     * Qui peut lire un document. L'habilitation est une condition absolue, vérifiée en premier :
     * aucune des règles suivantes (auteur, tour de traitement, déjà traité) ne peut la contourner.
     */
    public boolean peutConsulter(Utilisateur utilisateur, Document doc) {
        if (!utilisateur.estHabilitePour(doc.getNiveau())) {
            return false;
        }
        if (doc.getAuteur().getId().equals(utilisateur.getId())) {
            return true;
        }
        if (Circuits.statutPour(utilisateur.getRole()) == doc.getStatut()) {
            return true;
        }
        return etapeRepository.existsByDocumentAndValidateur(doc, utilisateur);
    }

    private void verifierBrouillon(Document doc, String action) {
        if (doc.getStatut() != StatutDocument.BROUILLON) {
            throw new BusinessRuleException("Seul un brouillon peut être " + action);
        }
    }
        /** Un auteur ne peut pas produire un document plus sensible que son habilitation. */
    private void verifierHabilitationProduction(Utilisateur auteur, NiveauConfidentialite niveau) {
        if (!auteur.estHabilitePour(niveau)) {
            auditService.log(ActionAudit.ACCES_REFUSE, auteur.getUsername(), null,
                    "Production refusée : niveau " + niveau + " supérieur à son habilitation "
                            + auteur.getHabilitation());
            throw new BusinessRuleException(
                    "Votre habilitation ne vous permet pas de produire un document de niveau " + niveau);
        }
    }

    private NiveauConfidentialite niveauParDefaut(TypeDocument type) {
        return switch (type) {
            case REQUISITION, CONFIDENTIEL_DIVERS -> NiveauConfidentialite.DIFFUSION_RESTREINTE;
            case RAPPORT -> NiveauConfidentialite.TRES_SECRET_DEFENSE;
            case NOTE_INTERNE -> NiveauConfidentialite.SECRET_DEFENSE;
        };
    }

    /** Niveau demandé, ou niveau par défaut du type. Interdit de descendre sous le minimum. */
    private NiveauConfidentialite determinerNiveau(TypeDocument type, NiveauConfidentialite demande) {
        NiveauConfidentialite minimum = niveauParDefaut(type);
        if (demande == null) {
            return minimum;
        }
        if (demande.compareTo(minimum) < 0) { // l'ordre de l'énumération = ordre de sensibilité
            throw new BusinessRuleException(
                    "Le niveau de confidentialité ne peut pas être inférieur à " + minimum
                            + " pour ce type de document");
        }
        return demande;
    }

    private String prefixe(TypeDocument type) {
        return switch (type) {
            case REQUISITION -> "REQ";
            case RAPPORT -> "RAP";
            case NOTE_INTERNE -> "NOT";
            case CONFIDENTIEL_DIVERS -> "CONF";
        };
    }

    private String genererReference(Document doc) {
        return "%s-%d-%05d".formatted(
                prefixe(doc.getType()), Year.now(ZoneOffset.UTC).getValue(), doc.getId());
    }
}