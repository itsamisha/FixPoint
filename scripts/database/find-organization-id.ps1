# PowerShell script to find organization ID for a user
# Usage: .\find-organization-id.ps1 -Username <your_username>

param(
    [Parameter(Mandatory=$true)]
    [string]$Username
)

Write-Host "Finding organization ID for user: $Username" -ForegroundColor Green

# API endpoint
$baseUrl = "http://localhost:8080"
$usersEndpoint = "$baseUrl/api/users"

try {
    # Get all users (this is a simplified approach - in production you'd have a specific endpoint)
    $response = Invoke-RestMethod -Uri $usersEndpoint -Method GET
    
    # Find the user by username
    $user = $response | Where-Object { $_.username -eq $Username }
    
    if ($user) {
        Write-Host "✓ Found user: $($user.fullName)" -ForegroundColor Green
        Write-Host "Username: $($user.username)" -ForegroundColor Cyan
        Write-Host "Email: $($user.email)" -ForegroundColor Cyan
        Write-Host "User Type: $($user.userType)" -ForegroundColor Cyan
        
        if ($user.organization) {
            Write-Host "Organization ID: $($user.organization.id)" -ForegroundColor Yellow
            Write-Host "Organization Name: $($user.organization.name)" -ForegroundColor Yellow
            Write-Host "`nYou can now use this organization ID to create reports:" -ForegroundColor Green
            Write-Host ".\create-reports-for-org.ps1 -OrganizationId $($user.organization.id)" -ForegroundColor Cyan
        } else {
            Write-Host "✗ User is not associated with any organization" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ User '$Username' not found" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Error finding user: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the application is running on http://localhost:8080" -ForegroundColor Yellow
}
