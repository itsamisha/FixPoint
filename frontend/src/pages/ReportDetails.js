import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  ThumbsUp, 
  MessageSquare,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import ReportMap from '../components/ReportMap';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

const ReportDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await reportService.getReportById(id);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user) {
      toast.error('Please log in to vote');
      navigate('/login');
      return;
    }

    setVoting(true);
    try {
      await reportService.voteForReport(report.id);
      toast.success('Vote updated successfully');
      fetchReport(); // Refresh report data
    } catch (error) {
      console.error('Error voting for report:', error);
      toast.error('Failed to update vote');
    } finally {
      setVoting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'status-submitted';
      case 'in_progress': return 'status-in_progress';
      case 'resolved': return 'status-resolved';
      case 'rejected': return 'status-rejected';
      default: return 'status-submitted';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'urgent': return 'priority-urgent';
      default: return 'priority-medium';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCategory = (category) => {
    return category?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const canEditReport = () => {
    return user && (
      user.id === report?.reporter?.id || 
      user.role === 'ADMIN' || 
      user.role === 'NGO_STAFF'
    );
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p>Loading report details...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-500">Report not found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-outline mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Header */}
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
                {canEditReport() && (
                  <button className="btn btn-outline">
                    <Edit size={16} className="mr-2" />
                    Edit
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`status-badge ${getStatusClass(report.status)}`}>
                  {report.status?.replace(/_/g, ' ')}
                </span>
                <span className={`priority-badge ${getPriorityClass(report.priority)}`}>
                  {report.priority}
                </span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {formatCategory(report.category)}
                </span>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          {report.imagePath && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Issue Photo</h2>
              </div>
              <div className="card-body">
                <img 
                  src={`http://localhost:8080/${report.imagePath}`}
                  alt="Issue"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}

          {/* Resolution */}
          {report.status === 'RESOLVED' && (
            <div className="card border-green-200 bg-green-50">
              <div className="card-header bg-green-100">
                <h2 className="card-title text-green-800 flex items-center">
                  <CheckCircle size={20} className="mr-2" />
                  Resolution
                </h2>
              </div>
              <div className="card-body">
                {report.resolutionNotes && (
                  <p className="text-green-700 mb-4">{report.resolutionNotes}</p>
                )}
                
                {report.resolutionImagePath && (
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">After Photo</h4>
                    <img 
                      src={`http://localhost:8080/${report.resolutionImagePath}`}
                      alt="Resolution"
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                )}
                
                <div className="text-sm text-green-600 mt-4">
                  Resolved on {formatDate(report.resolvedAt)}
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Comments ({report.commentCount || 0})</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-500 text-center py-4">
                Comments feature coming soon...
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Actions</h3>
            </div>
            <div className="card-body space-y-3">
              {user && (
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className={`w-full btn ${report.hasUserVoted ? 'btn-primary' : 'btn-outline'}`}
                >
                  <ThumbsUp size={16} className="mr-2" />
                  {voting ? 'Updating...' : (report.hasUserVoted ? 'Voted' : 'Vote')}
                  <span className="ml-auto">{report.voteCount || 0}</span>
                </button>
              )}
              
              <button className="w-full btn btn-outline">
                <MessageSquare size={16} className="mr-2" />
                Add Comment
              </button>
            </div>
          </div>

          {/* Report Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Report Information</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <User size={16} className="mr-2" />
                  Reported by
                </div>
                <p className="font-medium">
                  {report.reporter?.fullName || report.reporter?.username}
                </p>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar size={16} className="mr-2" />
                  Reported on
                </div>
                <p className="font-medium">{formatDate(report.createdAt)}</p>
              </div>

              {report.assignedTo && (
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <User size={16} className="mr-2" />
                    Assigned to
                  </div>
                  <p className="font-medium">
                    {report.assignedTo.fullName || report.assignedTo.username}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <MapPin size={16} className="mr-2" />
                  Location
                </div>
                {report.locationAddress && (
                  <p className="font-medium mb-2">{report.locationAddress}</p>
                )}
                <p className="text-sm text-gray-500">
                  {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Location</h3>
            </div>
            <div className="card-body p-0">
              <ReportMap
                reports={[report]}
                center={[report.latitude, report.longitude]}
                zoom={16}
                height="250px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
