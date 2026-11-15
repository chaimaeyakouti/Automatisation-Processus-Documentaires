package ma.inpt.gestdoc.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "document")
@Getter
@Setter
@NoArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TypeDocument type;

    @Column(nullable = false, length = 200)
    private String objet;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NiveauConfidentialite niveau;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutDocument statut = StatutDocument.BROUILLON;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;

    @Column(length = 100)
    private String serviceEmetteur;

    private int etapeCourante = 0;

    @Column(nullable = false, updatable = false)
    private Instant dateCreation;

    @Column(nullable = false)
    private Instant dateModification;

    @PrePersist
    void avantCreation() {
        dateCreation = Instant.now();
        dateModification = dateCreation;
    }

    @PreUpdate
    void avantModification() {
        dateModification = Instant.now();
    }
}