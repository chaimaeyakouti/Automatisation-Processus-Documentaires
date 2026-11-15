package ma.inpt.gestdoc.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destinataire_id")
    private Utilisateur destinataire;

    @Column(nullable = false, length = 300)
    private String message;

    private boolean lue = false;

    private Long documentId;

    @Column(nullable = false, updatable = false)
    private Instant dateCreation = Instant.now();
}