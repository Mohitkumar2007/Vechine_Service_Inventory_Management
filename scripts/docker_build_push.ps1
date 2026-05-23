param(
  [string]$DockerHubUsername = $(if ($env:DOCKERHUB_USERNAME) { $env:DOCKERHUB_USERNAME } else { "mohitkumar2007" }),
  [string]$ImageTag = $(if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { "latest" })
)

$ErrorActionPreference = "Stop"

$BackendImage = "$DockerHubUsername/vehicle-service-backend:$ImageTag"
$FrontendImage = "$DockerHubUsername/vehicle-service-frontend:$ImageTag"

Write-Host "Docker Hub username: $DockerHubUsername"
Write-Host "Image tag: $ImageTag"
Write-Host ""

docker info *> $null

Write-Host "Building backend image: $BackendImage"
docker build -f backend/Dockerfile -t $BackendImage .

Write-Host "Building frontend image: $FrontendImage"
docker build -f frontend/Dockerfile -t $FrontendImage .

Write-Host ""
Write-Host "Pushing backend image..."
docker push $BackendImage

Write-Host "Pushing frontend image..."
docker push $FrontendImage

Write-Host ""
Write-Host "Pushed Docker Hub images:"
Write-Host "  $BackendImage"
Write-Host "  $FrontendImage"
