param(
  [string]$EnvFile = ".env.vercel",
  [string]$Target = "production"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
  Write-Error "$EnvFile was not found. Create it from .env.vercel.example and put real Vercel secrets there."
}

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Error "Vercel CLI was not found. Install it with: npm i -g vercel"
}

Write-Host "Uploading environment variables from $EnvFile to Vercel target: $Target"
Write-Host "Make sure you already ran: vercel login && vercel link"

Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) {
    return
  }

  $parts = $line.Split("=", 2)
  if ($parts.Count -ne 2) {
    return
  }

  $key = $parts[0].Trim()
  $value = $parts[1].Trim().Trim('"')

  Write-Host "Setting $key"
  vercel env rm $key $Target --yes *> $null
  $value | vercel env add $key $Target *> $null
}

Write-Host "Done. Redeploy Vercel after updating environment variables."
