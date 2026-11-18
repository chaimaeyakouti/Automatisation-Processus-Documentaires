package ma.inpt.gestdoc.repository;

import java.util.List;
import ma.inpt.gestdoc.domain.Document;
import ma.inpt.gestdoc.domain.StatutDocument;
import ma.inpt.gestdoc.domain.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    // Spring génère la requête à partir du nom de la méthode
    List<Document> findByAuteurOrderByDateModificationDesc(Utilisateur auteur);
    List<Document> findByStatutOrderByDateModificationDesc(StatutDocument statut);
}