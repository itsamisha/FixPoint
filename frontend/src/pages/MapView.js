import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, List, Map } from 'lucide-react';
import { toast } from 'react-toastify';
import ReportMap from '../components/ReportMap';
import ReportCard from '../components/ReportCard';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

const MapView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, statusesRes] = await Promise.all([
        reportService.getCategories(),
        reportService.getStatuses()
      ]);
      setCategories(categoriesRes.data);
      setStatuses(statusesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        page: 0,
        size: 100, // Get more reports for map view
        sortBy: 'createdAt',
        sortDir: 'desc',
        ...filters
      };
      
      const response = await reportService.getPublicReports(params);
      setReports(response.data.content);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (report) => {
    setSelectedReport(report);
  };

  const handleVote = async (reportId) => {
    if (!user) {
      toast.error('Please log in to vote');
      navigate('/login');
      return;
    }

    try {
      await reportService.voteForReport(reportId);
      toast.success('Vote updated successfully');
      fetchReports(); // Refresh reports
    } catch (error) {
      console.error('Error voting for report:', error);
      toast.error('Failed to update vote');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: ''
    });
  };

  const formatEnumValue = (value) => {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Community Issues Map
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Map size={16} className="mr-1" />
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
              >
                <List size={16} className="mr-1" />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center">
                    <Filter size={16} className="mr-2" />
                    Filters
                  </h3>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {formatEnumValue(status)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {formatEnumValue(category)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Map Legend</h3>
              </div>
              <div className="card-body space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-white shadow"></div>
                  <span className="text-sm">Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
                  <span className="text-sm">Resolved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
                  <span className="text-sm">Rejected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="card">
                <div className="card-body text-center py-8">
                  <p>Loading reports...</p>
                </div>
              </div>
            ) : (
              <>
                {viewMode === 'map' ? (
                  <div className="card">
                    <div className="card-body p-0">
                      <ReportMap
                        reports={reports}
                        height="600px"
                        onMarkerClick={handleMarkerClick}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <ReportCard 
                        key={report.id} 
                        report={report}
                        onVote={handleVote}
                        showVoteButton={!!user}
                      />
                    ))}
                  </div>
                )}

                {reports.length === 0 && (
                  <div className="card">
                    <div className="card-body text-center py-8">
                      <p className="text-gray-600">
                        No reports found matching your criteria.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selected Report Modal/Popup */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedReport.title}</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <ReportCard 
                report={selectedReport}
                onVote={handleVote}
                showVoteButton={!!user}
              />
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    navigate(`/reports/${selectedReport.id}`);
                  }}
                  className="btn btn-primary"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
