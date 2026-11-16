package ma.inpt.gestdoc.dto;

import java.time.Instant;
import ma.inpt.gestdoc.domain.Document;
import ma.inpt.gestdoc.domain.NiveauConfidentialite;
import ma.inpt.gestdoc.domain.StatutDocument;
import ma.inpt.gestdoc.domain.TypeDocument;

public record DocumentDto(
        Long id,
        String reference,
        TypeDocument type,
        String objet,
        String contenu,
        NiveauConfidentialite niveau,
        StatutDocument statut,
        String auteur,
        String serviceEmetteur,
        Instant dateCreation,
        Instant dateModification) {

    public static DocumentDto from(Document d) {
        return new DocumentDto(
                d.getId(), d.getReference(), d.getType(), d.getObjet(), d.getContenu(),
                d.getNiveau(), d.getStatut(),
                d.getAuteur().getPrenom() + " " + d.getAuteur().getNom(),
                d.getServiceEmetteur(), d.getDateCreation(), d.getDateModification());
    }
}