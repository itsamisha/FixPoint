import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';
import ReportCard from '../components/ReportCard';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    submitted: 0
  });

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await reportService.getPublicReports({ 
        page: 0, 
        size: 6,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      
      setRecentReports(response.data.content);
      
      // Calculate stats (this is a simplified version)
      const reports = response.data.content;
      setStats({
        total: response.data.totalElements || reports.length,
        resolved: reports.filter(r => r.status === 'RESOLVED').length,
        inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
        submitted: reports.filter(r => r.status === 'SUBMITTED').length
      });
    } catch (error) {
      console.error('Error fetching recent reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
        <div className="container">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Report. Track. Resolve.
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              FixPoint connects citizens with local authorities to report and resolve 
              civic issues in your community. Together, we can make our neighborhoods better.
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/report/new" className="btn btn-primary text-lg px-8 py-3">
                    Report an Issue
                  </Link>
                  <Link to="/dashboard" className="btn btn-outline text-lg px-8 py-3">
                    View Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
                    Get Started
                  </Link>
                  <Link to="/map" className="btn btn-outline text-lg px-8 py-3">
                    Explore Map
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-blue-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-gray-600">Total Reports</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.submitted}</h3>
              <p className="text-gray-600">Submitted</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-blue-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.inProgress}</h3>
              <p className="text-gray-600">In Progress</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.resolved}</h3>
              <p className="text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How FixPoint Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Report Issues</h3>
              <p className="text-gray-600">
                Easily report civic problems in your area with photos, descriptions, 
                and precise location mapping.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Monitor the status of your reports and receive updates as local 
                authorities work on solutions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">See Results</h3>
              <p className="text-gray-600">
                View resolved issues and see the positive impact of community 
                engagement in your neighborhood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Recent Reports</h2>
            <Link to="/map" className="btn btn-outline">
              View All on Map
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading recent reports...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
              
              {recentReports.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No reports available yet.</p>
                  {user && (
                    <Link to="/report/new" className="btn btn-primary mt-4">
                      Be the first to report an issue
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-blue-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8">
              Join thousands of citizens working together to improve their communities.
            </p>
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Sign Up Today
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
