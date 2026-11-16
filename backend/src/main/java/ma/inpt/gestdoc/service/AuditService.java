package ma.inpt.gestdoc.service;

import ma.inpt.gestdoc.domain.ActionAudit;
import ma.inpt.gestdoc.domain.AuditLog;
import ma.inpt.gestdoc.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(ActionAudit action, String username, Long documentId, String detail) {
        auditLogRepository.save(new AuditLog(action, username, documentId, detail));
    }
}
