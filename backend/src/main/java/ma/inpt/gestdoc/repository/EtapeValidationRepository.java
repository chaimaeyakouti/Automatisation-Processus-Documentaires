package ma.inpt.gestdoc.repository;

import java.util.List;
import java.util.Optional;
import ma.inpt.gestdoc.domain.Document;
import ma.inpt.gestdoc.domain.EtapeValidation;
import ma.inpt.gestdoc.domain.StatutEtape;
import ma.inpt.gestdoc.domain.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EtapeValidationRepository extends JpaRepository<EtapeValidation, Long> {

    List<EtapeValidation> findByDocumentOrderByIdAsc(Document document);

    // L'étape courante = la première étape encore en attente
    Optional<EtapeValidation> findFirstByDocumentAndStatutOrderByOrdreAsc(Document document, StatutEtape statut);

    boolean existsByDocumentAndValidateur(Document document, Utilisateur validateur);

    void deleteByDocumentAndStatut(Document document, StatutEtape statut);

    void deleteByDocument(Document document);
}