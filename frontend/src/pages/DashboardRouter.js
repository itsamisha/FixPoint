import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import OrganizationDashboard from './OrganizationDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import Dashboard from './Dashboard'; // Fallback dashboard

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user type
  switch (user.userType) {
    case 'CITIZEN':
      return <CitizenDashboard />;
    
    case 'ORGANIZATION_ADMIN':
      return <OrganizationDashboard />;
    
    case 'ORGANIZATION_STAFF':
      return <EmployeeDashboard />;
    
    case 'VOLUNTEER':
      // For now, volunteers get the citizen dashboard
      // You can create a separate VolunteerDashboard later
      return <CitizenDashboard />;
    
    default:
      // Fallback to general dashboard
      return <Dashboard />;
  }
};

export default DashboardRouter;