import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Clock, CheckCircle, AlertCircle, Users, Award, Calendar, TrendingUp, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import ReportCard from '../components/ReportCard';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all reports for community view
      const allReports = await reportService.getAllReports();
      setReports(allReports || []);
      
      // Fetch user's reports
      if (user?.id) {
        const myReports = await reportService.getMyReports();
        setUserReports(myReports || []);
        
        // Calculate stats
        const totalReports = myReports?.length || 0;
        const pendingReports = myReports?.filter(r => r.status === 'PENDING')?.length || 0;
        const inProgressReports = myReports?.filter(r => r.status === 'IN_PROGRESS')?.length || 0;
        const resolvedReports = myReports?.filter(r => r.status === 'RESOLVED')?.length || 0;
        
        setStats({
          totalReports,
          pendingReports,
          inProgressReports,
          resolvedReports
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="empty-state">
            <div className="empty-state-icon">
              <div style={{
                width: '32px',
                height: '32px',
                border: '4px solid rgba(59, 130, 246, 0.3)',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
            <h4 className="empty-state-title">Loading your dashboard...</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Animated Background */}
      <div className="background-elements">
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
        
        {/* Grid Pattern */}
        <div className="grid-pattern"></div>
        
        {/* Floating Elements */}
        <div className="floating-particle floating-particle-1"></div>
        <div className="floating-particle floating-particle-2"></div>
        <div className="floating-particle floating-particle-3"></div>
      </div>
      
      <div className="dashboard-content">
        {/* Hero Header */}
        <div className="hero-header">
          <div className="hero-icon">
            <Award size={48} color="white" />
          </div>
          <h1 className="hero-title">
            Welcome Back
          </h1>
          <p className="hero-subtitle">{user?.fullName || user?.username}</p>
          <p className="hero-description">
            Your civic engagement command center - track impact, connect communities, drive change
          </p>
          <div className="hero-info">
            <div className="hero-info-badge">
              <Calendar size={20} color="#c084fc" />
              <span className="hero-info-text">Last active: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
            <p className="section-subtitle">Essential tools at your fingertips</p>
          </div>
          <div className="actions-grid">
            <Link to="/report" className="action-card">
              <div className="action-card-overlay"></div>
              <div className="action-card-content">
                <div className="action-icon">
                  <Plus size={40} color="white" />
                </div>
                <h3 className="action-title">Report Issue</h3>
                <p className="action-description">Submit new civic issues and help improve your community</p>
                <div className="action-link">
                  <span>Get Started</span>
                  <div className="action-arrow">
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link to="/map" className="action-card">
              <div className="action-card-overlay"></div>
              <div className="action-card-content">
                <div className="action-icon" style={{background: 'linear-gradient(135deg, #10b981, #14b8a6)'}}>
                  <MapPin size={40} color="white" />
                </div>
                <h3 className="action-title">Explore Map</h3>
                <p className="action-description">Discover issues and activities in your local area</p>
                <div className="action-link">
                  <span>View Map</span>
                  <div className="action-arrow">
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link to="/organizations" className="action-card">
              <div className="action-card-overlay"></div>
              <div className="action-card-content">
                <div className="action-icon" style={{background: 'linear-gradient(135deg, #3b82f6, #06b6d4)'}}>
                  <Users size={40} color="white" />
                </div>
                <h3 className="action-title">Organizations</h3>
                <p className="action-description">Connect with local groups and community leaders</p>
                <div className="action-link">
                  <span>Browse Groups</span>
                  <div className="action-arrow">
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-section">
          <div className="section-header">
            <h2 className="section-title">Your Impact Dashboard</h2>
            <p className="section-subtitle">Track your contributions and community engagement</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}}>
                  <AlertCircle size={28} color="white" />
                </div>
                <div className="stat-value">
                  <div className="stat-number">{stats.totalReports}</div>
                  <div className="stat-label">Total Reports</div>
                </div>
              </div>
              <div className="stat-description">Reports you've submitted</div>
              <div className="stat-trend">
                <TrendingUp size={16} />
                <span>+12% this month</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
                  <Clock size={28} color="white" />
                </div>
                <div className="stat-value">
                  <div className="stat-number">{stats.pendingReports}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
              <div className="stat-description">Awaiting response</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{width: '60%', background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}></div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #a855f7, #ec4899)'}}>
                  <Users size={28} color="white" />
                </div>
                <div className="stat-value">
                  <div className="stat-number">{stats.inProgressReports}</div>
                  <div className="stat-label">In Progress</div>
                </div>
              </div>
              <div className="stat-description">Being worked on</div>
              <div className="stat-progress">
                <div className="stat-progress-bar" style={{width: '75%', background: 'linear-gradient(135deg, #a855f7, #ec4899)'}}></div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #10b981, #14b8a6)'}}>
                  <CheckCircle size={28} color="white" />
                </div>
                <div className="stat-value">
                  <div className="stat-number">{stats.resolvedReports}</div>
                  <div className="stat-label">Resolved</div>
                </div>
              </div>
              <div className="stat-description">Successfully resolved</div>
              <div className="stat-trend">
                <CheckCircle size={16} />
                <span>Great work!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="navigation-tabs">
          <div className="tabs-container">
            <nav className="tabs-nav">
              <div className="tabs-list">
                {[
                  { id: 'overview', label: 'Overview', icon: AlertCircle },
                  { id: 'my-reports', label: 'My Reports', icon: Clock },
                  { id: 'recent', label: 'Community Reports', icon: MapPin }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <tab.icon className="tab-icon" size={20} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'overview' && (
            <div>
              <div className="overview-header">
                <h2 className="overview-title">Dashboard Overview</h2>
                <p className="overview-subtitle">Your civic engagement at a glance</p>
              </div>
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="overview-card-header">
                    <div className="overview-card-icon" style={{background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}}>
                      <Clock size={24} color="white" />
                    </div>
                    <h3 className="overview-card-title">Your Recent Reports</h3>
                  </div>
                  {userReports.slice(0, 3).length > 0 ? (
                    <div>
                      {userReports.slice(0, 3).map(report => (
                        <div key={report.id} className="report-item">
                          <div className="report-item-content">
                            <div className="report-item-info">
                              <h4 className="report-item-title">{report.title}</h4>
                              <p className="report-item-category">{report.category}</p>
                              <div className="report-item-date">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`report-status ${
                              report.status === 'RESOLVED' ? 'resolved' :
                              report.status === 'IN_PROGRESS' ? 'in-progress' : 'pending'
                            }`}>
                              {report.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => setActiveTab('my-reports')}
                        className="action-button"
                      >
                        View all your reports →
                      </button>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <AlertCircle size={32} color="#9ca3af" />
                      </div>
                      <h4 className="empty-state-title">No reports yet</h4>
                      <p className="empty-state-description">Start making a difference in your community by reporting your first issue.</p>
                      <Link to="/report" className="empty-state-button">
                        <Plus size={20} />
                        Submit Your First Report
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="overview-card">
                  <div className="overview-card-header">
                    <div className="overview-card-icon" style={{background: 'linear-gradient(135deg, #10b981, #14b8a6)'}}>
                      <Users size={24} color="white" />
                    </div>
                    <h3 className="overview-card-title">Community Activity</h3>
                  </div>
                  {reports.slice(0, 3).length > 0 ? (
                    <div>
                      {reports.slice(0, 3).map(report => (
                        <div key={report.id} className="report-item">
                          <div className="report-item-content">
                            <div className="report-item-info">
                              <h4 className="report-item-title">{report.title}</h4>
                              <p className="report-item-category">by {report.reporter?.fullName}</p>
                              <div className="report-item-date">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`report-status ${
                              report.priority === 'HIGH' ? 'pending' :
                              report.priority === 'MEDIUM' ? 'in-progress' : 'resolved'
                            }`}>
                              {report.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => setActiveTab('recent')}
                        className="action-button"
                        style={{background: 'linear-gradient(135deg, #10b981, #14b8a6)'}}
                      >
                        View all community reports →
                      </button>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Users size={32} color="#9ca3af" />
                      </div>
                      <h4 className="empty-state-title">No community activity</h4>
                      <p className="empty-state-description">Check back later for community reports</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-reports' && (
            <div>
              <div className="overview-header">
                <h2 className="overview-title">My Reports</h2>
                <p className="overview-subtitle">Track and manage all your submitted reports</p>
              </div>
              
              {userReports.length > 0 ? (
                <div style={{display: 'grid', gap: '24px'}}>
                  {userReports.map(report => (
                    <div key={report.id} style={{transform: 'scale(1)', transition: 'transform 0.3s ease'}}>
                      <ReportCard report={report} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <AlertCircle size={48} color="#6366f1" />
                  </div>
                  <h3 className="empty-state-title">No reports yet</h3>
                  <p className="empty-state-description">Start making a difference in your community by reporting your first issue. Every report helps make your neighborhood better.</p>
                  <Link to="/report" className="empty-state-button">
                    <Plus size={20} />
                    Submit Your First Report
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div>
              <div className="overview-header">
                <h2 className="overview-title">Community Reports</h2>
                <p className="overview-subtitle">See what's happening in your neighborhood</p>
              </div>
              {reports.length > 0 ? (
                <div style={{display: 'grid', gap: '24px'}}>
                  {reports.map(report => (
                    <div key={report.id} style={{transform: 'scale(1)', transition: 'transform 0.3s ease'}}>
                      <ReportCard report={report} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <MapPin size={48} color="#10b981" />
                  </div>
                  <h3 className="empty-state-title">No community reports yet</h3>
                  <p className="empty-state-description">Be the first to report an issue and help make your community better. Your voice matters!</p>
                  <Link to="/report" className="empty-state-button">
                    <Plus size={20} />
                    Report First Issue
                  </Link>
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
