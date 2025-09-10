// Test Data Setup Script for FixPoint Admin-Staff Mapping
// Run this script to create dummy staff and assign test reports

const API_BASE = 'http://localhost:8080/api';

// Test credentials
const TEST_CREDENTIALS = {
    admin: { email: 'admin@example.com', password: 'admin123' },
    staff: { email: 'staff@example.com', password: 'staff123' },
    citizen: { email: 'test@example.com', password: 'password' }
};

// Dummy staff data
const DUMMY_STAFF = [
    {
        username: 'john.smith',
        email: 'john.smith@testcity.gov',
        fullName: 'John Smith',
        jobTitle: 'Senior Engineer',
        department: 'Roads & Infrastructure',
        employeeId: 'EMP101',
        phone: '+1-555-0101'
    },
    {
        username: 'sarah.johnson',
        email: 'sarah.johnson@testcity.gov',
        fullName: 'Sarah Johnson',
        jobTitle: 'Field Supervisor',
        department: 'Water Management',
        employeeId: 'EMP102',
        phone: '+1-555-0102'
    },
    {
        username: 'mike.davis',
        email: 'mike.davis@testcity.gov',
        fullName: 'Mike Davis',
        jobTitle: 'Project Manager',
        department: 'Waste Management',
        employeeId: 'EMP103',
        phone: '+1-555-0103'
    },
    {
        username: 'lisa.wilson',
        email: 'lisa.wilson@testcity.gov',
        fullName: 'Lisa Wilson',
        jobTitle: 'Technical Specialist',
        department: 'Public Safety',
        employeeId: 'EMP104',
        phone: '+1-555-0104'
    },
    {
        username: 'robert.brown',
        email: 'robert.brown@testcity.gov',
        fullName: 'Robert Brown',
        jobTitle: 'Maintenance Coordinator',
        department: 'Urban Planning',
        employeeId: 'EMP105',
        phone: '+1-555-0105'
    }
];

// Test reports data
const TEST_REPORTS = [
    {
        title: "Critical Pothole on Main Street",
        description: "Large pothole causing traffic issues and vehicle damage near the city center. Needs immediate attention.",
        category: "ROADS_INFRASTRUCTURE",
        priority: "URGENT",
        latitude: 23.7450,
        longitude: 90.4095,
        locationAddress: "Main Street, Dhaka"
    },
    {
        title: "Street Light Outage - Oak Avenue",
        description: "Multiple street lights have been out for 2 weeks on Oak Avenue, creating safety concerns.",
        category: "STREET_LIGHTING",
        priority: "HIGH",
        latitude: 23.7461,
        longitude: 90.4106,
        locationAddress: "Oak Avenue, Dhaka"
    },
    {
        title: "Garbage Overflow in Residential Area",
        description: "Garbage bins overflowing in residential area, causing health and environmental issues.",
        category: "SANITATION_WASTE",
        priority: "HIGH",
        latitude: 23.7472,
        longitude: 90.4117,
        locationAddress: "Green Park, Dhaka"
    },
    {
        title: "Severe Water Drainage Issue",
        description: "Poor drainage causing waterlogging after rain, affecting traffic and property.",
        category: "WATER_DRAINAGE",
        priority: "URGENT",
        latitude: 23.7483,
        longitude: 90.4128,
        locationAddress: "Riverside Road, Dhaka"
    },
    {
        title: "Illegal Parking Blocking Emergency Access",
        description: "Cars blocking emergency access routes, creating safety hazards.",
        category: "TRAFFIC_PARKING",
        priority: "MEDIUM",
        latitude: 23.7494,
        longitude: 90.4139,
        locationAddress: "Hospital Road, Dhaka"
    },
    {
        title: "Construction Noise Violation",
        description: "Construction noise exceeding permitted hours in residential area.",
        category: "NOISE_POLLUTION",
        priority: "LOW",
        latitude: 23.7505,
        longitude: 90.4150,
        locationAddress: "Residential Block B, Dhaka"
    },
    {
        title: "Damaged Traffic Sign",
        description: "Traffic sign damaged and unclear, causing confusion for drivers.",
        category: "ROADS_INFRASTRUCTURE",
        priority: "MEDIUM",
        latitude: 23.7516,
        longitude: 90.4161,
        locationAddress: "Junction Road, Dhaka"
    },
    {
        title: "Stray Dog Safety Concern",
        description: "Pack of stray dogs causing safety concerns near school area.",
        category: "STRAY_ANIMALS",
        priority: "HIGH",
        latitude: 23.7527,
        longitude: 90.4172,
        locationAddress: "School Area, Dhaka"
    },
    {
        title: "Industrial Air Pollution",
        description: "Heavy pollution from nearby factory affecting air quality.",
        category: "ENVIRONMENTAL",
        priority: "URGENT",
        latitude: 23.7538,
        longitude: 90.4183,
        locationAddress: "Industrial Zone, Dhaka"
    },
    {
        title: "Inadequate Park Lighting",
        description: "Inadequate lighting in public park creating security concerns.",
        category: "PUBLIC_SAFETY",
        priority: "HIGH",
        latitude: 23.7549,
        longitude: 90.4194,
        locationAddress: "City Park, Dhaka"
    }
];

// Utility functions
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
}

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

// Main functions
async function createDummyStaff() {
    log('Creating dummy staff members...');
    
    let createdCount = 0;
    for (const staff of DUMMY_STAFF) {
        try {
            const response = await makeRequest(`${API_BASE}/auth/register`, {
                method: 'POST',
                body: JSON.stringify({
                    ...staff,
                    password: 'staff123',
                    userType: 'ORGANIZATION_STAFF',
                    organizationId: 1 // Assuming test organization has ID 1
                })
            });
            
            log(`Created staff: ${staff.fullName} (${staff.username})`, 'success');
            createdCount++;
        } catch (error) {
            log(`Staff ${staff.fullName} might already exist: ${error.message}`, 'error');
        }
    }
    
    log(`Created ${createdCount} staff members`, 'success');
    return createdCount;
}

async function createTestReports() {
    log('Creating test reports...');
    
    let createdCount = 0;
    for (const report of TEST_REPORTS) {
        try {
            const response = await makeRequest(`${API_BASE}/reports`, {
                method: 'POST',
                body: JSON.stringify({
                    ...report,
                    targetOrganizationIds: [1], // Assuming test organization has ID 1
                    notifyVolunteers: false
                })
            });
            
            log(`Created report: ${report.title}`, 'success');
            createdCount++;
        } catch (error) {
            log(`Failed to create report ${report.title}: ${error.message}`, 'error');
        }
    }
    
    log(`Created ${createdCount} test reports`, 'success');
    return createdCount;
}

async function assignReportsToStaff() {
    log('Assigning reports to staff members...');
    
    try {
        // Get unassigned reports
        const reportsResponse = await makeRequest(`${API_BASE}/reports/organization/1`);
        const reports = reportsResponse.content || reportsResponse;
        
        // Get staff members
        const staffResponse = await makeRequest(`${API_BASE}/organizations/1/staff`);
        const staff = staffResponse.data || staffResponse;
        
        if (!staff || staff.length === 0) {
            log('No staff members found to assign reports to', 'error');
            return 0;
        }
        
        const unassignedReports = reports.filter(report => !report.assignedTo);
        log(`Found ${unassignedReports.length} unassigned reports`);
        
        let assignedCount = 0;
        for (let i = 0; i < unassignedReports.length; i++) {
            const report = unassignedReports[i];
            const staffMember = staff[i % staff.length]; // Distribute reports among staff
            
            try {
                await makeRequest(`${API_BASE}/reports/${report.id}/assign-staff`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        assignedToId: staffMember.id
                    })
                });
                
                log(`Assigned "${report.title}" to ${staffMember.fullName}`, 'success');
                assignedCount++;
            } catch (error) {
                log(`Failed to assign report ${report.title}: ${error.message}`, 'error');
            }
        }
        
        log(`Assigned ${assignedCount} reports to staff members`, 'success');
        return assignedCount;
        
    } catch (error) {
        log(`Error assigning reports: ${error.message}`, 'error');
        return 0;
    }
}

async function viewCurrentData() {
    log('Fetching current data...');
    
    try {
        // Get organizations
        const orgsResponse = await makeRequest(`${API_BASE}/organizations`);
        log(`Organizations: ${orgsResponse.length} found`);
        
        // Get staff
        const staffResponse = await makeRequest(`${API_BASE}/organizations/1/staff`);
        const staff = staffResponse.data || staffResponse;
        log(`Staff members: ${staff ? staff.length : 0} found`);
        
        // Get reports
        const reportsResponse = await makeRequest(`${API_BASE}/reports/organization/1`);
        const reports = reportsResponse.content || reportsResponse;
        log(`Reports: ${reports.length} found`);
        
        const assignedReports = reports.filter(r => r.assignedTo);
        const unassignedReports = reports.filter(r => !r.assignedTo);
        
        log(`  - Assigned: ${assignedReports.length}`);
        log(`  - Unassigned: ${unassignedReports.length}`);
        
        // Show some sample data
        if (staff && staff.length > 0) {
            log('\nSample Staff:');
            staff.slice(0, 3).forEach(s => {
                log(`  - ${s.fullName} (${s.jobTitle})`);
            });
        }
        
        if (reports.length > 0) {
            log('\nSample Reports:');
            reports.slice(0, 3).forEach(r => {
                const assigned = r.assignedTo ? ` → ${r.assignedTo.fullName}` : ' (Unassigned)';
                log(`  - ${r.title}${assigned}`);
            });
        }
        
    } catch (error) {
        log(`Error fetching data: ${error.message}`, 'error');
    }
}

async function setupCompleteTestData() {
    log('🚀 Starting complete test data setup...', 'success');
    
    try {
        // Step 1: Create dummy staff
        await createDummyStaff();
        
        // Step 2: Create test reports
        await createTestReports();
        
        // Step 3: Assign reports to staff
        await assignReportsToStaff();
        
        log('✅ Test data setup completed successfully!', 'success');
        log('You can now log in as admin@example.com / admin123 to see the test data.');
        log('Or log in as staff@example.com / staff123 to see assigned reports.');
        
    } catch (error) {
        log(`Error during setup: ${error.message}`, 'error');
    }
}

// Export functions for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        setupCompleteTestData,
        createDummyStaff,
        createTestReports,
        assignReportsToStaff,
        viewCurrentData,
        TEST_CREDENTIALS
    };
} else {
    // Browser environment
    window.TestDataSetup = {
        setupCompleteTestData,
        createDummyStaff,
        createTestReports,
        assignReportsToStaff,
        viewCurrentData,
        TEST_CREDENTIALS
    };
}

// If running directly in Node.js
if (typeof require !== 'undefined' && require.main === module) {
    console.log('🔧 FixPoint Test Data Setup Script');
    console.log('=====================================');
    console.log('');
    console.log('Available functions:');
    console.log('- setupCompleteTestData() - Complete setup');
    console.log('- createDummyStaff() - Create staff only');
    console.log('- createTestReports() - Create reports only');
    console.log('- assignReportsToStaff() - Assign reports only');
    console.log('- viewCurrentData() - View current data');
    console.log('');
    console.log('Test Credentials:');
    console.log('- Admin: admin@example.com / admin123');
    console.log('- Staff: staff@example.com / staff123');
    console.log('- Citizen: test@example.com / password');
    console.log('');
    
    // Run complete setup if no arguments
    if (process.argv.length === 2) {
        setupCompleteTestData();
    }
}
