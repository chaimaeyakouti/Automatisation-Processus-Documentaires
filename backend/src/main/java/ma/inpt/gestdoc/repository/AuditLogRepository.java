package ma.inpt.gestdoc.repository;

import ma.inpt.gestdoc.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
