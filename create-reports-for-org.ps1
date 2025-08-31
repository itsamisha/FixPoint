# PowerShell script to create test reports for a specific organization
# Usage: .\create-reports-for-org.ps1 -OrganizationId <your_org_id>

param(
    [Parameter(Mandatory=$true)]
    [int]$OrganizationId
)

Write-Host "Creating test reports for organization ID: $OrganizationId" -ForegroundColor Green

# Test data for reports
$reports = @(
    @{
        title = "Pothole on Main Street"
        description = "Large pothole causing traffic issues near the city center"
        category = "ROADS_INFRASTRUCTURE"
        status = "SUBMITTED"
        priority = "HIGH"
        latitude = 23.7450
        longitude = 90.4095
        locationAddress = "Main Street, Dhaka"
    },
    @{
        title = "Street Light Not Working"
        description = "Street light has been out for 2 weeks on Oak Avenue"
        category = "STREET_LIGHTING"
        status = "IN_PROGRESS"
        priority = "MEDIUM"
        latitude = 23.7461
        longitude = 90.4106
        locationAddress = "Oak Avenue, Dhaka"
    },
    @{
        title = "Garbage Overflow"
        description = "Garbage bins overflowing in residential area"
        category = "SANITATION_WASTE"
        status = "SUBMITTED"
        priority = "HIGH"
        latitude = 23.7472
        longitude = 90.4117
        locationAddress = "Green Park, Dhaka"
    },
    @{
        title = "Water Drainage Issue"
        description = "Poor drainage causing waterlogging after rain"
        category = "WATER_DRAINAGE"
        status = "IN_PROGRESS"
        priority = "URGENT"
        latitude = 23.7483
        longitude = 90.4128
        locationAddress = "Riverside Road, Dhaka"
    },
    @{
        title = "Illegal Parking"
        description = "Cars blocking emergency access"
        category = "TRAFFIC_PARKING"
        status = "RESOLVED"
        priority = "MEDIUM"
        latitude = 23.7494
        longitude = 90.4139
        locationAddress = "Hospital Road, Dhaka"
    }
)

# API endpoint
$baseUrl = "http://localhost:8080"
$reportsEndpoint = "$baseUrl/api/reports"

Write-Host "Creating reports..." -ForegroundColor Yellow

foreach ($report in $reports) {
    $reportData = @{
        title = $report.title
        description = $report.description
        category = $report.category
        status = $report.status
        priority = $report.priority
        latitude = $report.latitude
        longitude = $report.longitude
        locationAddress = $report.locationAddress
        targetOrganizationIds = @($OrganizationId)
        notifyVolunteers = $false
    }

    try {
        $response = Invoke-RestMethod -Uri $reportsEndpoint -Method POST -Body ($reportData | ConvertTo-Json) -ContentType "application/json"
        Write-Host "✓ Created report: $($report.title)" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to create report: $($report.title)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nReport creation completed!" -ForegroundColor Green
Write-Host "You can now log in as your organization admin to see these reports." -ForegroundColor Cyan
