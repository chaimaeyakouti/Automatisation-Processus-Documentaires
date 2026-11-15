package ma.inpt.gestdoc.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audit_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(updatable = false)
    private Long documentId;

    @Column(nullable = false, updatable = false)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false, length = 30)
    private ActionAudit action;

    @Column(nullable = false, updatable = false)
    private Instant dateHeure;

    @Column(updatable = false, length = 500)
    private String detail;

    public AuditLog(ActionAudit action, String username, Long documentId, String detail) {
        this.action = action;
        this.username = username;
        this.documentId = documentId;
        this.detail = detail;
        this.dateHeure = Instant.now();
    }
}