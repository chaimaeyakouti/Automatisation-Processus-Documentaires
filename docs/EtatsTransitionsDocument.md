``` mermaid
stateDiagram
    [*] --> BROUILLON

    BROUILLON --> SOUMIS : soumettre (circuit avec relecteur)
    BROUILLON --> EN_VALIDATION : soumettre (circuit sans relecteur)

    SOUMIS --> EN_VALIDATION : relecteur approuve
    SOUMIS --> BROUILLON : relecteur demande une modification
    SOUMIS --> REJETE : relecteur rejette

    EN_VALIDATION --> VALIDE : validateur approuve
    EN_VALIDATION --> BROUILLON : validateur demande une modification
    EN_VALIDATION --> REJETE : validateur rejette

    REJETE --> BROUILLON : auteur modifie
    REJETE --> SOUMIS : auteur resoumet (avec relecteur)
    REJETE --> EN_VALIDATION : auteur resoumet (sans relecteur)

    VALIDE --> [*]
```
