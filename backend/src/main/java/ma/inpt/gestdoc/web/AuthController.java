package ma.inpt.gestdoc.web;

import jakarta.validation.Valid;
import ma.inpt.gestdoc.domain.ActionAudit;
import ma.inpt.gestdoc.domain.Utilisateur;
import ma.inpt.gestdoc.dto.LoginRequest;
import ma.inpt.gestdoc.dto.LoginResponse;
import ma.inpt.gestdoc.dto.UtilisateurInfo;
import ma.inpt.gestdoc.repository.UtilisateurRepository;
import ma.inpt.gestdoc.security.JwtService;
import ma.inpt.gestdoc.service.AuditService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;
    private final AuditService auditService;

    public AuthController(AuthenticationManager authenticationManager,
                          UtilisateurRepository utilisateurRepository,
                          JwtService jwtService,
                          AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.utilisateurRepository = utilisateurRepository;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (AuthenticationException e) {
            String tentative = request.username().length() > 100
                    ? request.username().substring(0, 100) : request.username();
            auditService.log(ActionAudit.LOGIN_ECHEC, tentative, null, "Échec de connexion");
            throw e;
        }
        Utilisateur u = utilisateurRepository.findByUsername(request.username()).orElseThrow();
        auditService.log(ActionAudit.LOGIN, u.getUsername(), null, "Connexion réussie");
        String token = jwtService.generateToken(u.getUsername(), u.getRole().name());
        return new LoginResponse(token, u.getUsername(), u.getPrenom() + " " + u.getNom(), u.getRole().name());
    }

    @GetMapping("/me")
    public UtilisateurInfo me(Authentication authentication) {
        Utilisateur u = utilisateurRepository.findByUsername(authentication.getName()).orElseThrow();
        String habilitation = u.getHabilitation() == null ? null : u.getHabilitation().name();
        return new UtilisateurInfo(u.getUsername(), u.getPrenom() + " " + u.getNom(),
                u.getRole().name(), u.getService(), habilitation);
    }
}