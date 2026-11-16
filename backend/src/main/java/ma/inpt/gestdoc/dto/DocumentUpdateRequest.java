package ma.inpt.gestdoc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import ma.inpt.gestdoc.domain.NiveauConfidentialite;

public record DocumentUpdateRequest(
        @NotBlank @Size(max = 200) String objet,
        @Size(max = 20000) String contenu,
        NiveauConfidentialite niveau) {
}