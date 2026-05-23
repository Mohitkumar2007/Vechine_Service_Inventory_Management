param(
  [string]$DockerHubUsername = $(if ($env:DOCKERHUB_USERNAME) { $env:DOCKERHUB_USERNAME } else { "mohitkumar2007" }),
  [string]$ImageTag = $(if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { "latest" })
)

$ErrorActionPreference = "Stop"

$BackendImage = "$DockerHubUsername/vehicle-service-backend:$ImageTag"
$FrontendImage = "$DockerHubUsername/vehicle-service-frontend:$ImageTag"

function Invoke-Docker {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & docker @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "docker $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

Write-Host "Docker Hub username: $DockerHubUsername"
Write-Host "Image tag: $ImageTag"
Write-Host ""

Invoke-Docker info *> $null

Write-Host "Building backend image: $BackendImage"
Invoke-Docker build -f backend/Dockerfile -t $BackendImage .

Write-Host "Building frontend image: $FrontendImage"
Invoke-Docker build -f frontend/Dockerfile -t $FrontendImage .

Write-Host ""
Write-Host "Pushing backend image..."
Invoke-Docker push $BackendImage

Write-Host "Pushing frontend image..."
Invoke-Docker push $FrontendImage

Write-Host ""
Write-Host "Pushed Docker Hub images:"
Write-Host "  $BackendImage"
Write-Host "  $FrontendImage"
