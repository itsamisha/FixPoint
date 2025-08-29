import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  UserPlus,
  Settings,
  BarChart3,
  UserCog
} from 'lucide-react';
import { toast } from 'react-toastify';
import ReportCard from '../components/ReportCard';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

const OrganizationDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]);
  const [organizationReports, setOrganizationReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    assignedToMe: 0,
    resolvedReports: 0,
    inProgressReports: 0
  });

  const isAdmin = user?.userType === 'ORGANIZATION_ADMIN';
  const isStaff = user?.userType === 'ORGANIZATION_STAFF';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch different data based on user role
      const promises = [];
      
      if (isAdmin) {
        // Admin can see all organization reports
        promises.push(reportService.getOrganizationReports(user.organizationId));
      }
      
      if (isStaff || isAdmin) {
        // Both admin and staff can see reports assigned to them
        promises.push(reportService.getAssignedReports());
      }
      
      const results = await Promise.all(promises);
      
      if (isAdmin) {
        const orgReports = results[0].data.content || results[0].data;
        setOrganizationReports(orgReports);
        
        // Calculate stats for admin
        const statsData = {
          totalReports: orgReports.length,
          pendingReports: orgReports.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length,
          assignedToMe: orgReports.filter(r => r.assignedTo?.id === user.id).length,
          resolvedReports: orgReports.filter(r => r.status === 'RESOLVED').length,
          inProgressReports: orgReports.filter(r => r.status === 'IN_PROGRESS').length
        };
        setStats(statsData);
        
        if (results[1]) {
          setAssignedReports(results[1].data.content || results[1].data);
        }
      } else if (isStaff) {
        const assignedReports = results[0].data.content || results[0].data;
        setAssignedReports(assignedReports);
        
        // Calculate stats for staff
        const statsData = {
          totalReports: assignedReports.length,
          pendingReports: assignedReports.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length,
          assignedToMe: assignedReports.length,
          resolvedReports: assignedReports.filter(r => r.status === 'RESOLVED').length,
          inProgressReports: assignedReports.filter(r => r.status === 'IN_PROGRESS').length
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignReport = async (reportId, staffMemberId) => {
    try {
      await reportService.assignReport(reportId, staffMemberId);
      toast.success('Report assigned successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error assigning report:', error);
      toast.error('Failed to assign report');
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      await reportService.updateReportStatus(reportId, status);
      toast.success('Report status updated successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, description, action }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Organization Admin Dashboard' : 'Staff Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.organization?.name} • {user?.jobTitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {isAdmin && (
              <>
                <Link
                  to="/organization/staff"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Manage Staff
                </Link>
                <Link
                  to="/organization/reports"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  All Reports
                </Link>
                <Link
                  to="/organization/settings"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Organization Settings
                </Link>
              </>
            )}
            <Link
              to="/reports/assigned"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <UserCog className="w-5 h-5 mr-2" />
              My Assigned Reports
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {isAdmin && (
            <StatCard
              icon={FileText}
              title="Total Reports"
              value={stats.totalReports}
              color="#3B82F6"
              description="All organization reports"
            />
          )}
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pendingReports}
            color="#F59E0B"
            description="Awaiting action"
          />
          <StatCard
            icon={UserCog}
            title="Assigned to Me"
            value={stats.assignedToMe}
            color="#8B5CF6"
            description="Your active reports"
          />
          <StatCard
            icon={Users}
            title="In Progress"
            value={stats.inProgressReports}
            color="#06B6D4"
            description="Being worked on"
          />
          <StatCard
            icon={CheckCircle}
            title="Resolved"
            value={stats.resolvedReports}
            color="#10B981"
            description="Successfully completed"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'assigned', label: 'My Assigned Reports', icon: UserCog },
                ...(isAdmin ? [{ id: 'all-reports', label: 'All Organization Reports', icon: FileText }] : []),
                ...(isAdmin ? [{ id: 'staff', label: 'Staff Management', icon: Users }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Recent Assigned Reports</h3>
                  {assignedReports.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {assignedReports.slice(0, 3).map(report => (
                        <div key={report.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{report.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{report.category}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Reported by: {report.reporter?.fullName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                report.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {report.status.replace(/_/g, ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                report.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                report.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {report.priority}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            {report.status !== 'RESOLVED' && (
                              <>
                                <button
                                  onClick={() => handleUpdateReportStatus(report.id, 'IN_PROGRESS')}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Start Work
                                </button>
                                <button
                                  onClick={() => handleUpdateReportStatus(report.id, 'RESOLVED')}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Mark Resolved
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <Link 
                        to="#" 
                        onClick={() => setActiveTab('assigned')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all assigned reports →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No reports assigned to you yet.</p>
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Recent Organization Reports</h3>
                    {organizationReports.slice(0, 3).length > 0 ? (
                      <div className="space-y-3">
                        {organizationReports.slice(0, 3).map(report => (
                          <div key={report.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{report.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  by {report.reporter?.fullName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {report.assignedTo ? `Assigned to: ${report.assignedTo.fullName}` : 'Unassigned'}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        <Link 
                          to="#" 
                          onClick={() => setActiveTab('all-reports')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View all organization reports →
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 py-8">No recent reports for your organization.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assigned' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Assigned Reports</h2>
              </div>
              
              {assignedReports.length > 0 ? (
                <div className="grid gap-6">
                  {assignedReports.map(report => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <ReportCard report={report} />
                      <div className="mt-4 flex space-x-2">
                        {report.status !== 'RESOLVED' && (
                          <>
                            <button
                              onClick={() => handleUpdateReportStatus(report.id, 'IN_PROGRESS')}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Start Work
                            </button>
                            <button
                              onClick={() => handleUpdateReportStatus(report.id, 'RESOLVED')}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Mark as Resolved
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserCog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned reports</h3>
                  <p className="text-gray-500">Reports assigned to you will appear here.</p>
                </div>
              )}
            </div>
          )}

          {isAdmin && activeTab === 'all-reports' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">All Organization Reports</h2>
              {organizationReports.length > 0 ? (
                <div className="grid gap-6">
                  {organizationReports.map(report => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <ReportCard report={report} />
                      {/* Add assignment controls for admin */}
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium">Assigned to:</span> {report.assignedTo?.fullName || 'Unassigned'}
                          </div>
                          <div className="flex space-x-2">
                            <select 
                              className="text-sm border rounded px-2 py-1"
                              defaultValue=""
                              onChange={(e) => e.target.value && handleAssignReport(report.id, e.target.value)}
                            >
                              <option value="">Assign to staff member...</option>
                              {/* You'll need to fetch staff members */}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports</h3>
                  <p className="text-gray-500">Reports submitted to your organization will appear here.</p>
                </div>
              )}
            </div>
          )}

          {isAdmin && activeTab === 'staff' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Staff Management</h2>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Management</h3>
                <p className="text-gray-500 mb-6">Manage your organization's staff members and their assignments.</p>
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/organization/staff/invite"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Invite Staff Member
                  </Link>
                  <Link
                    to="/organization/staff/list"
                    className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    View All Staff
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
