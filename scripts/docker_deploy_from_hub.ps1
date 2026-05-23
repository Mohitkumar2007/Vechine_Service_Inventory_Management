param(
  [string]$DockerHubUsername = $(if ($env:DOCKERHUB_USERNAME) { $env:DOCKERHUB_USERNAME } else { "mohitkumar2007" }),
  [string]$ImageTag = $(if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { "latest" })
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env")) {
  Write-Error ".env not found. Create it from .env.example and set MYSQL_PASSWORD before deploying."
}

$env:DOCKERHUB_USERNAME = $DockerHubUsername
$env:IMAGE_TAG = $ImageTag

docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d

Write-Host "Deployment started."
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend health through frontend: http://localhost:3000/api/health/"
