package ma.inpt.gestdoc.config;

import ma.inpt.gestdoc.domain.Role;
import ma.inpt.gestdoc.domain.Utilisateur;
import ma.inpt.gestdoc.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final String MOT_DE_PASSE_DEMO = "Test@1234";

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (utilisateurRepository.count() > 0) {
            return;
        }
        creer("admin", "Admin", "Système", Role.ADMIN, "Administration");
        creer("redacteur1", "Benali", "Yasmine", Role.REDACTEUR, "Service A");
        creer("relecteur1", "Alaoui", "Omar", Role.RELECTEUR, "Service A");
        creer("validateur1", "Tazi", "Karim", Role.VALIDATEUR, "Direction");
        creer("redacteur2", "Idrissi", "Sara", Role.REDACTEUR, "Service B");
    }

    private void creer(String username, String nom, String prenom, Role role, String service) {
        Utilisateur u = new Utilisateur();
        u.setUsername(username);
        u.setMotDePasse(passwordEncoder.encode(MOT_DE_PASSE_DEMO));
        u.setNom(nom);
        u.setPrenom(prenom);
        u.setRole(role);
        u.setService(service);
        utilisateurRepository.save(u);
    }
}