package ma.inpt.gestdoc.dto;

import java.time.Instant;
import ma.inpt.gestdoc.domain.Document;
import ma.inpt.gestdoc.domain.NiveauConfidentialite;
import ma.inpt.gestdoc.domain.StatutDocument;
import ma.inpt.gestdoc.domain.TypeDocument;

// Version allégée (sans le contenu) pour les listes
public record DocumentResume(
        Long id,
        String reference,
        TypeDocument type,
        String objet,
        NiveauConfidentialite niveau,
        StatutDocument statut,
        Instant dateModification,
        String auteur) {

    public static DocumentResume from(Document d) {
        return new DocumentResume(
                d.getId(), d.getReference(), d.getType(), d.getObjet(),
                d.getNiveau(), d.getStatut(), d.getDateModification(),
                d.getAuteur().getPrenom() + " " + d.getAuteur().getNom());
    }
}