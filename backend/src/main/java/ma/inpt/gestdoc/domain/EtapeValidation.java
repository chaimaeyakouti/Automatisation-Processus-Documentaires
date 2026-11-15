package ma.inpt.gestdoc.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "etape_validation")
@Getter
@Setter
@NoArgsConstructor
public class EtapeValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(nullable = false)
    private int ordre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role roleAttendu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validateur_id")
    private Utilisateur validateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutEtape statut = StatutEtape.EN_ATTENTE;

    private Instant dateAction;

    @Column(length = 500)
    private String commentaire;
}
