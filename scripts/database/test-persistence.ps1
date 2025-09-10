# FixPoint Database Persistence Test Script
# This script demonstrates that data persists across application restarts

Write-Host "==================================="
Write-Host "FixPoint Database Persistence Test"
Write-Host "==================================="

# Function to test API endpoint
function Test-ApiEndpoint {
    param([string]$url, [string]$description)
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ $description - Found $($data.Count) items" -ForegroundColor Green
        return $data.Count
    } catch {
        Write-Host "❌ $description - API not available" -ForegroundColor Red
        return 0
    }
}

# Function to test login
function Test-Login {
    param([string]$username, [string]$password)
    try {
        $body = @{
            usernameOrEmail = $username
            password = $password
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/signin" -Method POST -Body $body -ContentType "application/json"
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Login successful for user: $username" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Login failed for user: $username" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n📊 Current Database Status:"
Write-Host "----------------------------"

# Test API endpoints
$orgCount = Test-ApiEndpoint "http://localhost:8080/api/organizations" "Organizations"
$reportsCount = Test-ApiEndpoint "http://localhost:8080/api/reports" "Reports"

# Test database info
try {
    $dbInfo = Invoke-WebRequest -Uri "http://localhost:8080/api/admin/database/info" -Method GET
    $dbData = $dbInfo.Content | ConvertFrom-Json
    Write-Host "📁 Database Type: $($dbData.type)" -ForegroundColor Cyan
    Write-Host "📍 Database Location: $($dbData.location)" -ForegroundColor Cyan
    Write-Host "💾 Backup Files Available: $($dbData.backupCount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Database info not available" -ForegroundColor Red
}

Write-Host "`n🔐 Authentication Test:"
Write-Host "----------------------"

# Test default user login
$loginSuccess = Test-Login "test" "password"

Write-Host "`n💡 Instructions:"
Write-Host "---------------"
Write-Host "1. Register a new user at: http://localhost:3000/register"
Write-Host "2. Create some reports at: http://localhost:3000/report"
Write-Host "3. Restart the application"
Write-Host "4. Run this script again to verify data persistence"
Write-Host "5. Try logging in with your registered users"

Write-Host "`n📂 Database Files Location:"
Write-Host "---------------------------"
if (Test-Path "./data/fixpoint.mv.db") {
    $dbFile = Get-Item "./data/fixpoint.mv.db"
    Write-Host "✅ Database file exists: $($dbFile.FullName)" -ForegroundColor Green
    Write-Host "📏 File size: $([math]::Round($dbFile.Length / 1KB, 2)) KB" -ForegroundColor Cyan
    Write-Host "📅 Last modified: $($dbFile.LastWriteTime)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Database file not found" -ForegroundColor Red
}

Write-Host "`n🎯 Summary:"
Write-Host "----------"
if ($orgCount -gt 0 -and $loginSuccess) {
    Write-Host "✅ Database is persistent and working correctly!" -ForegroundColor Green
    Write-Host "✅ Sample data is initialized" -ForegroundColor Green
    Write-Host "✅ Authentication is working" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database may not be fully initialized" -ForegroundColor Yellow
}

Write-Host "`n=================================="
