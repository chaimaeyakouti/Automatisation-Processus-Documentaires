function Check($name, [scriptblock]$test) {
  try {
    if (& $test) { Write-Host "[OK]   $name" -ForegroundColor Green }
    else         { Write-Host "[FAIL] $name" -ForegroundColor Red }
  } catch {
    Write-Host "[FAIL] $name -> $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n--- Hygiène du dépôt ---"
Check "Fichier .env présent"                 { Test-Path .env }
Check ".env non suivi par Git"               { -not (git ls-files .env) }
Check "target/ et node_modules/ non suivis"  { -not (git ls-files backend/target frontend/node_modules) }

Write-Host "`n--- Conteneurs ---"
Check "MySQL en bonne santé (healthy)"       { (docker inspect -f '{{.State.Health.Status}}' gestdoc-db) -eq "healthy" }
Check "Backend en cours d'exécution"         { (docker inspect -f '{{.State.Running}}' gestdoc-backend) -eq "true" }
Check "Frontend en cours d'exécution"        { (docker inspect -f '{{.State.Running}}' gestdoc-frontend) -eq "true" }

Write-Host "`n--- Communication ---"
Check "Backend répond (8080/api/ping)"       { (Invoke-RestMethod http://localhost:8080/api/ping).status -eq "ok" }
Check "Proxy front -> back (5173/api/ping)"  { (Invoke-RestMethod http://localhost:5173/api/ping).status -eq "ok" }
Check "Requête SQL réussie dans MySQL"       { ("SELECT 1;" | docker compose exec -T db sh -c 'mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -N' 2>$null) -match "1" }

Write-Host "`n--- Isolation réseau ---"
Check "Frontend ne peut PAS joindre la base" { (docker compose exec -T frontend sh -c 'nc -z -w 2 db 3306 && echo ACCESSIBLE || echo INACCESSIBLE') -match "INACCESSIBLE" }

Check "Connexion JWT (redacteur1)"           { (Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login -ContentType 'application/json' -Body '{"username":"redacteur1","password":"Test@1234"}').token.Length -gt 20 }
Check "Route protégée refuse sans jeton"     { try { Invoke-RestMethod http://localhost:8080/api/auth/me | Out-Null; $false } catch { $_.Exception.Response.StatusCode.value__ -eq 401 } }