package ma.inpt.gestdoc.config;

import ma.inpt.gestdoc.domain.NiveauConfidentialite;
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
        assurer("admin", "Admin", "Système", Role.ADMIN, "Administration",
                NiveauConfidentialite.DIFFUSION_RESTREINTE);
        assurer("redacteur1", "Benali", "Yasmine", Role.REDACTEUR, "Service A",
                NiveauConfidentialite.SECRET_DEFENSE);
        assurer("redacteur2", "Chraibi", "Sara", Role.REDACTEUR, "Service B",
                NiveauConfidentialite.DIFFUSION_RESTREINTE);
        assurer("relecteur1", "Alaoui", "Omar", Role.RELECTEUR, "Service A",
                NiveauConfidentialite.CONFIDENTIEL_DEFENSE);
        assurer("relecteur2", "Fassi", "Leila", Role.RELECTEUR, "Service B",
                NiveauConfidentialite.SECRET_DEFENSE);
        assurer("validateur1", "Tazi", "Karim", Role.VALIDATEUR, "Direction",
                NiveauConfidentialite.TRES_SECRET_DEFENSE);
    }

    /** Crée le compte s'il n'existe pas ; complète l'habilitation seulement si elle est vide. */
    private void assurer(String username, String nom, String prenom, Role role, String service,
                         NiveauConfidentialite habilitation) {
        Utilisateur u = utilisateurRepository.findByUsername(username).orElseGet(() -> {
            Utilisateur nouveau = new Utilisateur();
            nouveau.setUsername(username);
            nouveau.setMotDePasse(passwordEncoder.encode(MOT_DE_PASSE_DEMO));
            nouveau.setNom(nom);
            nouveau.setPrenom(prenom);
            nouveau.setRole(role);
            nouveau.setService(service);
            return nouveau;
        });
        if (u.getHabilitation() == null) {
            u.setHabilitation(habilitation);
        }
        utilisateurRepository.save(u);
    }
}