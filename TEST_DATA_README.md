# 🔧 FixPoint Test Data Setup

This guide will help you set up dummy staff members and test reports to test the admin-staff mapping functionality.

## 📋 Test Credentials

The system comes with pre-configured test users:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | `admin@example.com` | `admin123` | Test admin dashboard and staff assignment |
| **Staff** | `staff@example.com` | `staff123` | Test staff dashboard and progress updates |
| **Citizen** | `test@example.com` | `password` | Create test reports |

## 🚀 Quick Setup Options

### Option 1: Web Interface (Recommended)

1. Open `add-test-reports.html` in your browser
2. Click **"Create Test Data"** button
3. Watch the activity log for progress
4. Use the test credentials to log in and test

### Option 2: Node.js Script

1. Make sure your backend is running on `http://localhost:8080`
2. Run the script:
   ```bash
   node test-data-setup.js
   ```

### Option 3: Manual Setup

If you prefer to set up data manually, you can use the individual functions in the web interface or script.

## 📊 What Gets Created

### 👥 Dummy Staff Members

The system will create 5 additional staff members:

1. **John Smith** - Senior Engineer (Roads & Infrastructure)
2. **Sarah Johnson** - Field Supervisor (Water Management)
3. **Mike Davis** - Project Manager (Waste Management)
4. **Lisa Wilson** - Technical Specialist (Public Safety)
5. **Robert Brown** - Maintenance Coordinator (Urban Planning)

### 📝 Test Reports

10 test reports with various categories and priorities:

- **Critical Pothole on Main Street** (URGENT - Roads)
- **Street Light Outage - Oak Avenue** (HIGH - Lighting)
- **Garbage Overflow in Residential Area** (HIGH - Sanitation)
- **Severe Water Drainage Issue** (URGENT - Drainage)
- **Illegal Parking Blocking Emergency Access** (MEDIUM - Traffic)
- **Construction Noise Violation** (LOW - Noise)
- **Damaged Traffic Sign** (MEDIUM - Roads)
- **Stray Dog Safety Concern** (HIGH - Animals)
- **Industrial Air Pollution** (URGENT - Environmental)
- **Inadequate Park Lighting** (HIGH - Safety)

## 🧪 Testing the Admin-Staff Mapping

### 1. Admin Dashboard Testing

1. Log in as `admin@example.com` / `admin123`
2. Navigate to the Organization Dashboard
3. You should see:
   - **Stats Cards** showing total reports, pending, assigned, etc.
   - **Staff Management** tab with staff workload
   - **All Organization Reports** tab with assignment options
   - **Unassigned Reports** counter

### 2. Staff Assignment Testing

1. In the admin dashboard, go to **"All Organization Reports"**
2. Click **"Assign to Staff"** on unassigned reports
3. Select a staff member from the dropdown
4. Verify the report appears in the staff's assigned tasks

### 3. Staff Dashboard Testing

1. Log in as `staff@example.com` / `staff123`
2. Navigate to the Staff Dashboard
3. You should see:
   - **Assigned Reports** with progress tracking
   - **Progress Update** functionality
   - **Work Stage** management
   - **Status Updates** visible to admin

### 4. Progress Tracking Testing

1. As a staff member, click on an assigned report
2. Update the progress percentage (0-100%)
3. Change the work stage (Not Started → Assessment → Planning → In Progress → Quality Check → Completed)
4. Add progress notes
5. Save the update
6. Log in as admin to see real-time updates

## 🔄 Real-time Updates

The admin dashboard includes:
- **Auto-refresh** every 30 seconds
- **Live progress bars** with color coding
- **Work stage badges** with unique colors
- **Staff workload** tracking
- **Status changes** visible immediately

## 🎯 Expected Workflow

1. **Admin assigns report** → Report appears in staff's "Total Assigned" tasks
2. **Staff updates progress** → Admin sees real-time updates in dashboard
3. **Staff changes work stage** → Status automatically updates (e.g., "In Progress")
4. **Staff completes work** → Report marked as "Resolved"

## 🐛 Troubleshooting

### Common Issues

1. **"No staff members found"**
   - Run the test data setup again
   - Check if the backend is running on port 8080

2. **"Reports not showing"**
   - Verify you're logged in with the correct organization
   - Check if reports were created successfully

3. **"Assignment not working"**
   - Ensure you're logged in as an admin user
   - Check if staff members exist in the organization

### API Endpoints Used

- `POST /api/auth/register` - Create staff members
- `POST /api/reports` - Create test reports
- `GET /api/reports/organization/{id}` - Get organization reports
- `GET /api/organizations/{id}/staff` - Get organization staff
- `PUT /api/reports/{id}/assign-staff` - Assign report to staff
- `PUT /api/reports/{id}/progress` - Update report progress

## 📈 Monitoring Progress

The system provides visual indicators:

- **Progress bars** with color coding (red → yellow → blue → green)
- **Work stage badges** with unique colors
- **Status badges** (pending, in-progress, resolved)
- **Priority indicators** (urgent, high, medium, low)
- **Staff workload cards** showing assignment counts

## 🎉 Success Indicators

You'll know the admin-staff mapping is working when:

✅ Admin can see all organization reports  
✅ Admin can assign reports to specific staff  
✅ Staff can see their assigned reports  
✅ Staff can update progress and work stages  
✅ Admin sees real-time updates from staff  
✅ Progress bars and status badges update correctly  
✅ Staff workload is tracked and displayed  

## 🔧 Customization

You can modify the test data by editing:
- `DUMMY_STAFF` array in `test-data-setup.js`
- `TEST_REPORTS` array in `test-data-setup.js`
- Staff creation logic in `add-test-reports.html`

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify the backend API is running
3. Ensure you're using the correct test credentials
4. Check the activity log in the web interface

---

**Happy Testing! 🚀**
