package ma.inpt.gestdoc.web;

import jakarta.validation.Valid;
import java.util.List;
import ma.inpt.gestdoc.dto.DocumentDto;
import ma.inpt.gestdoc.dto.DocumentRequest;
import ma.inpt.gestdoc.dto.DocumentResume;
import ma.inpt.gestdoc.dto.DocumentUpdateRequest;
import ma.inpt.gestdoc.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('REDACTEUR')")
    public ResponseEntity<DocumentDto> creer(@Valid @RequestBody DocumentRequest request,
                                             Authentication authentication) {
        DocumentDto cree = documentService.creer(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cree);
    }

    @GetMapping("/mes-documents")
    @PreAuthorize("hasRole('REDACTEUR')")
    public List<DocumentResume> mesDocuments(Authentication authentication) {
        return documentService.mesDocuments(authentication.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('REDACTEUR','RELECTEUR','VALIDATEUR')")
    public DocumentDto obtenir(@PathVariable Long id, Authentication authentication) {
        return documentService.obtenir(authentication.getName(), id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('REDACTEUR')")
    public DocumentDto modifier(@PathVariable Long id,
                                @Valid @RequestBody DocumentUpdateRequest request,
                                Authentication authentication) {
        return documentService.modifier(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('REDACTEUR')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id, Authentication authentication) {
        documentService.supprimer(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}