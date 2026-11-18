package ma.inpt.gestdoc.web;

import jakarta.validation.Valid;
import java.util.List;
import ma.inpt.gestdoc.dto.DecisionRequest;
import ma.inpt.gestdoc.dto.DocumentDto;
import ma.inpt.gestdoc.dto.DocumentResume;
import ma.inpt.gestdoc.dto.EtapeDto;
import ma.inpt.gestdoc.service.WorkflowService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documents")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasRole('REDACTEUR')")
    public DocumentDto soumettre(@PathVariable Long id, Authentication authentication) {
        return workflowService.soumettre(authentication.getName(), id);
    }

    @GetMapping("/a-traiter")
    @PreAuthorize("hasAnyRole('RELECTEUR','VALIDATEUR')")
    public List<DocumentResume> aTraiter(Authentication authentication) {
        return workflowService.aTraiter(authentication.getName());
    }

    @PostMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('RELECTEUR','VALIDATEUR')")
    public DocumentDto decider(@PathVariable Long id,
                               @Valid @RequestBody DecisionRequest request,
                               Authentication authentication) {
        return workflowService.traiter(authentication.getName(), id, request);
    }

    @GetMapping("/{id}/etapes")
    @PreAuthorize("hasAnyRole('REDACTEUR','RELECTEUR','VALIDATEUR')")
    public List<EtapeDto> etapes(@PathVariable Long id, Authentication authentication) {
        return workflowService.etapes(authentication.getName(), id);
    }
}
