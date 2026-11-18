package ma.inpt.gestdoc.dto;

import java.time.Instant;
import ma.inpt.gestdoc.domain.EtapeValidation;
import ma.inpt.gestdoc.domain.Role;
import ma.inpt.gestdoc.domain.StatutEtape;

public record EtapeDto(
        Long id,
        int ordre,
        Role roleAttendu,
        StatutEtape statut,
        String validateur,
        Instant dateAction,
        String commentaire) {

    public static EtapeDto from(EtapeValidation e) {
        String validateur = e.getValidateur() == null
                ? null
                : e.getValidateur().getPrenom() + " " + e.getValidateur().getNom();
        return new EtapeDto(e.getId(), e.getOrdre(), e.getRoleAttendu(), e.getStatut(),
                validateur, e.getDateAction(), e.getCommentaire());
    }
}