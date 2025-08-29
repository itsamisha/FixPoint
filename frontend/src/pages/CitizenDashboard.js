import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import ReportCard from '../components/ReportCard';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    inProgressReports: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [userReportsRes, allReportsRes] = await Promise.all([
        reportService.getUserReports(),
        reportService.getReports({ limit: 10 })
      ]);
      
      setUserReports(userReportsRes.data.content || userReportsRes.data);
      setReports(allReportsRes.data.content || allReportsRes.data);
      
      // Calculate stats from user reports
      const userReportsData = userReportsRes.data.content || userReportsRes.data;
      const statsData = {
        totalReports: userReportsData.length,
        pendingReports: userReportsData.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length,
        resolvedReports: userReportsData.filter(r => r.status === 'RESOLVED').length,
        inProgressReports: userReportsData.filter(r => r.status === 'IN_PROGRESS').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, description }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
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
            Welcome back, {user?.fullName || user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track your reports and stay updated on community issues in your area.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/report"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Report New Issue
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <MapPin className="w-5 h-5 mr-2" />
              View Map
            </Link>
            <Link
              to="/organizations"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Browse Organizations
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={AlertCircle}
            title="Total Reports"
            value={stats.totalReports}
            color="#3B82F6"
            description="Reports you've submitted"
          />
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pendingReports}
            color="#F59E0B"
            description="Awaiting response"
          />
          <StatCard
            icon={Users}
            title="In Progress"
            value={stats.inProgressReports}
            color="#8B5CF6"
            description="Being worked on"
          />
          <StatCard
            icon={CheckCircle}
            title="Resolved"
            value={stats.resolvedReports}
            color="#10B981"
            description="Successfully resolved"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: AlertCircle },
                { id: 'my-reports', label: 'My Reports', icon: Clock },
                { id: 'recent', label: 'Recent Community Reports', icon: MapPin }
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
                  <h3 className="text-lg font-medium mb-3">Your Recent Reports</h3>
                  {userReports.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {userReports.slice(0, 3).map(report => (
                        <div key={report.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{report.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{report.category}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                              report.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                      <Link 
                        to="#" 
                        onClick={() => setActiveTab('my-reports')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all your reports →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">You haven't submitted any reports yet.</p>
                      <Link
                        to="/report"
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Your First Report
                      </Link>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Community Activity</h3>
                  {reports.slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {reports.slice(0, 3).map(report => (
                        <div key={report.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{report.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">by {report.reporter?.fullName}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      <Link 
                        to="#" 
                        onClick={() => setActiveTab('recent')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all community reports →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 py-8">No recent community reports.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-reports' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Reports</h2>
                <Link
                  to="/report"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Report
                </Link>
              </div>
              
              {userReports.length > 0 ? (
                <div className="grid gap-6">
                  {userReports.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                  <p className="text-gray-500 mb-6">Start by reporting your first community issue.</p>
                  <Link
                    to="/report"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Submit Your First Report
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Community Reports</h2>
              {reports.length > 0 ? (
                <div className="grid gap-6">
                  {reports.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No community reports</h3>
                  <p className="text-gray-500">Be the first to report an issue in your community.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
