package ma.inpt.gestdoc.domain;

import java.util.List;

/** Définit les circuits de validation et le lien entre un rôle et le statut du document. */
public final class Circuits {

    private Circuits() {
    }

    /** Rôles qui interviennent, dans l'ordre, après la rédaction. */
    public static List<Role> pour(TypeDocument type) {
        return switch (type) {
            case RAPPORT -> List.of(Role.RELECTEUR, Role.VALIDATEUR);
            case REQUISITION, NOTE_INTERNE, CONFIDENTIEL_DIVERS -> List.of(Role.VALIDATEUR);
        };
    }

    /** Statut que prend un document lorsque l'étape courante attend ce rôle (null pour les autres rôles). */
    public static StatutDocument statutPour(Role role) {
        return switch (role) {
            case RELECTEUR -> StatutDocument.SOUMIS;
            case VALIDATEUR -> StatutDocument.EN_VALIDATION;
            default -> null;
        };
    }
}