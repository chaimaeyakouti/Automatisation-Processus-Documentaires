package ma.inpt.gestdoc.service;

import ma.inpt.gestdoc.domain.ActionAudit;
import ma.inpt.gestdoc.domain.AuditLog;
import ma.inpt.gestdoc.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // REQUIRES_NEW : l'écriture du journal est validée toute seule, même si l'opération
    // qui l'appelle échoue ensuite et est annulée (ex. : accès refusé).
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(ActionAudit action, String username, Long documentId, String detail) {
        auditLogRepository.save(new AuditLog(action, username, documentId, detail));
    }
}