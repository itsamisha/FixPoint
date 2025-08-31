import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  FileText,
  PlayCircle,
  PauseCircle,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { reportService } from '../services/reportService';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [assignedReports, setAssignedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedReport, setSelectedReport] = useState(null);
  const [progressUpdate, setProgressUpdate] = useState({
    progressPercentage: 0,
    progressNotes: '',
    workStage: 'NOT_STARTED'
  });

  const workStages = [
    { value: 'NOT_STARTED', label: 'Not Started', color: '#9CA3AF' },
    { value: 'ASSESSMENT', label: 'Assessment', color: '#F59E0B' },
    { value: 'PLANNING', label: 'Planning', color: '#3B82F6' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: '#06B6D4' },
    { value: 'QUALITY_CHECK', label: 'Quality Check', color: '#8B5CF6' },
    { value: 'COMPLETED', label: 'Completed', color: '#10B981' },
    { value: 'ON_HOLD', label: 'On Hold', color: '#EF4444' }
  ];

  useEffect(() => {
    fetchAssignedReports();
  }, []);

  const fetchAssignedReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getMyAssignedReports();
      setAssignedReports(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching assigned reports:', error);
      toast.error('Failed to load assigned reports');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (reportId) => {
    try {
      await reportService.updateReportProgress(reportId, progressUpdate);
      toast.success('Progress updated successfully');
      setSelectedReport(null);
      fetchAssignedReports(); // Refresh data
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getStageColor = (stage) => {
    const stageObj = workStages.find(s => s.value === stage);
    return stageObj ? stageObj.color : '#9CA3AF';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#10B981';
    if (percentage >= 75) return '#06B6D4';
    if (percentage >= 50) return '#3B82F6';
    if (percentage >= 25) return '#F59E0B';
    return '#EF4444';
  };

  const filteredReports = assignedReports.filter(report => {
    if (activeTab === 'active') {
      return report.status !== 'RESOLVED' && report.status !== 'REJECTED';
    } else if (activeTab === 'completed') {
      return report.status === 'RESOLVED';
    }
    return true;
  });

  const stats = {
    total: assignedReports.length,
    active: assignedReports.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED').length,
    completed: assignedReports.filter(r => r.status === 'RESOLVED').length,
    inProgress: assignedReports.filter(r => r.workStage === 'IN_PROGRESS').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.fullName} • {user?.organization?.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Assigned</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Tasks</p>
                <p className="text-3xl font-bold text-orange-600">{stats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-cyan-600">{stats.inProgress}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-cyan-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'active', label: 'Active Tasks', icon: Clock },
                { id: 'completed', label: 'Completed', icon: CheckCircle },
                { id: 'all', label: 'All Reports', icon: FileText }
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

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.category?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Reported by: {report.reporter?.fullName}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    report.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    report.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {report.priority}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{report.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${report.progressPercentage || 0}%`,
                      backgroundColor: getProgressColor(report.progressPercentage || 0)
                    }}
                  ></div>
                </div>
              </div>

              {/* Work Stage */}
              <div className="mb-4">
                <span 
                  className="px-3 py-1 text-sm rounded-full text-white"
                  style={{ backgroundColor: getStageColor(report.workStage || 'NOT_STARTED') }}
                >
                  {workStages.find(s => s.value === (report.workStage || 'NOT_STARTED'))?.label}
                </span>
              </div>

              {/* Progress Notes */}
              {report.progressNotes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{report.progressNotes}</p>
                  {report.progressUpdatedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Updated: {new Date(report.progressUpdatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setProgressUpdate({
                      progressPercentage: report.progressPercentage || 0,
                      progressNotes: report.progressNotes || '',
                      workStage: report.workStage || 'NOT_STARTED'
                    });
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Update Progress</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {activeTab === 'active' ? 'No active tasks assigned to you.' :
               activeTab === 'completed' ? 'No completed tasks yet.' :
               'No reports assigned to you.'}
            </p>
          </div>
        )}
      </div>

      {/* Progress Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Progress</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedReport.title}</p>

            <div className="space-y-4">
              {/* Progress Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Percentage: {progressUpdate.progressPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressUpdate.progressPercentage}
                  onChange={(e) => setProgressUpdate(prev => ({
                    ...prev,
                    progressPercentage: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              {/* Work Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Stage</label>
                <select
                  value={progressUpdate.workStage}
                  onChange={(e) => setProgressUpdate(prev => ({
                    ...prev,
                    workStage: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {workStages.map(stage => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progress Notes</label>
                <textarea
                  value={progressUpdate.progressNotes}
                  onChange={(e) => setProgressUpdate(prev => ({
                    ...prev,
                    progressNotes: e.target.value
                  }))}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the current progress and any updates..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProgressUpdate(selectedReport.id)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
