# Test Organizations API
Write-Host "Testing Organizations API..." -ForegroundColor Green

try {
    # Get all organizations
    $organizations = Invoke-RestMethod -Uri "http://localhost:8080/api/organizations" -Method GET
    
    Write-Host "Total Organizations Found: $($organizations.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    # Group by type
    $grouped = $organizations | Group-Object type
    
    foreach ($group in $grouped) {
        Write-Host "$($group.Name): $($group.Count) organizations" -ForegroundColor Cyan
        foreach ($org in $group.Group) {
            Write-Host "  - $($org.name) (City: $($org.city))" -ForegroundColor White
        }
        Write-Host ""
    }
    
    # Show NGOs specifically
    $ngos = $organizations | Where-Object { $_.type -eq "NGO" }
    Write-Host "NGOs Found: $($ngos.Count)" -ForegroundColor Green
    foreach ($ngo in $ngos) {
        Write-Host "  - $($ngo.name)" -ForegroundColor Green
        Write-Host "    Description: $($ngo.description)" -ForegroundColor Gray
        Write-Host "    Service Areas: $($ngo.serviceAreas)" -ForegroundColor Gray
        Write-Host "    Categories: $($ngo.categories)" -ForegroundColor Gray
        Write-Host ""
    }
    
} catch {
    Write-Host "Error calling API: $($_.Exception.Message)" -ForegroundColor Red
}
