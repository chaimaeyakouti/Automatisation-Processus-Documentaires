package ma.inpt.gestdoc.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "utilisateur")
@Getter
@Setter
@NoArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String motDePasse; // toujours un hash BCrypt, jamais le mot de passe en clair

    @Column(nullable = false, length = 80)
    private String nom;

    @Column(nullable = false, length = 80)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 100)
    private String service;

    @Column(nullable = false)
    private boolean actif = true;

        // Niveau maximal de confidentialité auquel la personne a accès (null = aucun accès)
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private NiveauConfidentialite habilitation;

    /** Vrai si l'habilitation couvre ce niveau (l'énumération est ordonnée du moins au plus sensible). */
    public boolean estHabilitePour(NiveauConfidentialite niveau) {
        return habilitation != null && habilitation.compareTo(niveau) >= 0;
    }
}