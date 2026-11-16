package ma.inpt.gestdoc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ma.inpt.gestdoc.domain.NiveauConfidentialite;
import ma.inpt.gestdoc.domain.TypeDocument;

public record DocumentRequest(
        @NotNull TypeDocument type,
        @NotBlank @Size(max = 200) String objet,
        @Size(max = 20000) String contenu,
        NiveauConfidentialite niveau) {
}