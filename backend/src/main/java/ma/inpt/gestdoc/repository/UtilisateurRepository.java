package ma.inpt.gestdoc.repository;

import java.util.Optional;
import ma.inpt.gestdoc.domain.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByUsername(String username);
}
