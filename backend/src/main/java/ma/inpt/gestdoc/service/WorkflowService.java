package ma.inpt.gestdoc.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import ma.inpt.gestdoc.domain.ActionAudit;
import ma.inpt.gestdoc.domain.Circuits;
import ma.inpt.gestdoc.domain.Decision;
import ma.inpt.gestdoc.domain.Document;
import ma.inpt.gestdoc.domain.EtapeValidation;
import ma.inpt.gestdoc.domain.Role;
import ma.inpt.gestdoc.domain.StatutDocument;
import ma.inpt.gestdoc.domain.StatutEtape;
import ma.inpt.gestdoc.domain.Utilisateur;
import ma.inpt.gestdoc.dto.DecisionRequest;
import ma.inpt.gestdoc.dto.DocumentDto;
import ma.inpt.gestdoc.dto.DocumentResume;
import ma.inpt.gestdoc.dto.EtapeDto;
import ma.inpt.gestdoc.exception.BusinessRuleException;
import ma.inpt.gestdoc.exception.ResourceNotFoundException;
import ma.inpt.gestdoc.repository.DocumentRepository;
import ma.inpt.gestdoc.repository.EtapeValidationRepository;
import ma.inpt.gestdoc.repository.UtilisateurRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkflowService {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final EtapeValidationRepository etapeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AuditService auditService;

    public WorkflowService(DocumentService documentService,
                           DocumentRepository documentRepository,
                           EtapeValidationRepository etapeRepository,
                           UtilisateurRepository utilisateurRepository,
                           AuditService auditService) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.etapeRepository = etapeRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.auditService = auditService;
    }

    /** L'auteur soumet son document : les étapes du circuit sont créées et le premier destinataire est désigné. */
    @Transactional
    public DocumentDto soumettre(String username, Long id) {
        Document doc = documentService.chargerPourAuteur(username, id);
        if (doc.getStatut() != StatutDocument.BROUILLON && doc.getStatut() != StatutDocument.REJETE) {
            throw new BusinessRuleException("Seul un brouillon ou un document rejeté peut être soumis");
        }
        if (doc.getContenu() == null || doc.getContenu().isBlank()) {
            throw new BusinessRuleException("Le contenu est vide : complétez le document avant de le soumettre");
        }

        etapeRepository.deleteByDocumentAndStatut(doc, StatutEtape.EN_ATTENTE); // par sécurité

        List<Role> circuit = Circuits.pour(doc.getType());
        int ordre = 1;
        for (Role role : circuit) {
            EtapeValidation etape = new EtapeValidation();
            etape.setDocument(doc);
            etape.setOrdre(ordre++);
            etape.setRoleAttendu(role);
            etapeRepository.save(etape);
        }

        doc.setEtapeCourante(1);
        doc.setStatut(Circuits.statutPour(circuit.get(0)));
        doc = documentRepository.saveAndFlush(doc);

        auditService.log(ActionAudit.SOUMISSION, username, id,
                "Soumission de " + doc.getReference() + " (circuit : " + circuit + ")");
        return DocumentDto.from(doc);
    }

    @Transactional(readOnly = true)
    public List<DocumentResume> aTraiter(String username) {
        Utilisateur utilisateur = utilisateur(username);
        StatutDocument statut = Circuits.statutPour(utilisateur.getRole());
        if (statut == null) {
            return List.of();
        }
        return documentRepository.findByStatutOrderByDateModificationDesc(statut).stream()
                .filter(d -> utilisateur.estHabilitePour(d.getNiveau()))
                .map(DocumentResume::from)
                .toList();
    }
    /** Approuver, rejeter ou demander une modification à l'étape courante. */
    @Transactional
    public DocumentDto traiter(String username, Long id, DecisionRequest request) {
        Utilisateur acteur = utilisateur(username);
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));

        EtapeValidation etape = etapeRepository
                .findFirstByDocumentAndStatutOrderByOrdreAsc(doc, StatutEtape.EN_ATTENTE)
                .orElseThrow(() -> new BusinessRuleException("Ce document n'est pas en attente de traitement"));

        if (etape.getRoleAttendu() != acteur.getRole()) {
            auditService.log(ActionAudit.ACCES_REFUSE, username, id,
                    "Tentative de traitement de " + doc.getReference() + " hors de son rôle");
            throw new AccessDeniedException("Accès refusé");
        }
        if (!acteur.estHabilitePour(doc.getNiveau())) {
            auditService.log(ActionAudit.ACCES_REFUSE, username, id,
                    "Habilitation insuffisante pour traiter " + doc.getReference()
                            + " (niveau " + doc.getNiveau() + ")");
            throw new AccessDeniedException("Accès refusé");
        }

        String commentaire = request.commentaire() == null ? null : request.commentaire().trim();
        boolean motifObligatoire = request.decision() != Decision.APPROUVER;
        if (motifObligatoire && (commentaire == null || commentaire.isEmpty())) {
            throw new BusinessRuleException(
                    "Un motif est obligatoire pour rejeter un document ou demander une modification");
        }

        etape.setValidateur(acteur);
        etape.setDateAction(Instant.now());

        switch (request.decision()) {
            case APPROUVER -> approuver(doc, etape, commentaire, username);
            case REJETER -> renvoyer(doc, etape, commentaire, StatutDocument.REJETE,
                    ActionAudit.REJET, "Rejet : " + commentaire, username);
            case DEMANDER_MODIFICATION -> renvoyer(doc, etape, "Demande de modification : " + commentaire,
                    StatutDocument.BROUILLON, ActionAudit.DEMANDE_MODIFICATION,
                    "Demande de modification : " + commentaire, username);
        }

        doc = documentRepository.saveAndFlush(doc);
        return DocumentDto.from(doc);
    }

    /** Historique des étapes d'un document, de la plus ancienne à la plus récente. */
    @Transactional(readOnly = true)
    public List<EtapeDto> etapes(String username, Long id) {
        Utilisateur utilisateur = utilisateur(username);
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));
        if (!documentService.peutConsulter(utilisateur, doc)) {
            auditService.log(ActionAudit.ACCES_REFUSE, username, id,
                    "Tentative d'accès à l'historique de " + doc.getReference());
            throw new AccessDeniedException("Accès refusé");
        }
        return etapeRepository.findByDocumentOrderByIdAsc(doc).stream()
                .map(EtapeDto::from)
                .toList();
    }

    // ---------- transitions ----------

    private void approuver(Document doc, EtapeValidation etape, String commentaire, String username) {
        etape.setStatut(StatutEtape.APPROUVEE);
        etape.setCommentaire(commentaire);
        etapeRepository.flush(); // pour que la recherche de l'étape suivante voie ce changement

        Optional<EtapeValidation> suivante = etapeRepository
                .findFirstByDocumentAndStatutOrderByOrdreAsc(doc, StatutEtape.EN_ATTENTE);

        if (suivante.isPresent()) {
            doc.setEtapeCourante(suivante.get().getOrdre());
            doc.setStatut(Circuits.statutPour(suivante.get().getRoleAttendu()));
            auditService.log(ActionAudit.VALIDATION, username, doc.getId(),
                    "Étape " + etape.getOrdre() + " (" + etape.getRoleAttendu() + ") approuvée, transmis à "
                            + suivante.get().getRoleAttendu());
        } else {
            doc.setEtapeCourante(0);
            doc.setStatut(StatutDocument.VALIDE);
            auditService.log(ActionAudit.VALIDATION, username, doc.getId(),
                    "Document " + doc.getReference() + " validé");
        }
    }

    private void renvoyer(Document doc, EtapeValidation etape, String commentaireEtape,
                          StatutDocument statutCible, ActionAudit action, String detailAudit, String username) {
        etape.setStatut(StatutEtape.REJETEE);
        etape.setCommentaire(commentaireEtape);
        etapeRepository.flush();

        // Les étapes suivantes n'ont plus lieu d'être ; l'historique déjà traité est conservé
        etapeRepository.deleteByDocumentAndStatut(doc, StatutEtape.EN_ATTENTE);

        doc.setEtapeCourante(0);
        doc.setStatut(statutCible);
        auditService.log(action, username, doc.getId(), detailAudit);
    }

    private Utilisateur utilisateur(String username) {
        return utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }
}