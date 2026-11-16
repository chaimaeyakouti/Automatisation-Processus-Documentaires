package ma.inpt.gestdoc.dto;

public record LoginResponse(String token, String username, String nomComplet, String role) {}