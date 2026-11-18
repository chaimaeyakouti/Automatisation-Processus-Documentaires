package ma.inpt.gestdoc.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ma.inpt.gestdoc.domain.Decision;

public record DecisionRequest(
        @NotNull Decision decision,
        @Size(max = 400) String commentaire) {
}
