import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, CheckCircle, AlertCircle, Info } from "lucide-react";
import ReportCard from "../../components/ReportCard/ReportCard";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../contexts/AuthContext";
import { DEMO_MODE } from "../../services/api";

const Home = () => {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    submitted: 0,
  });

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await reportService.getPublicReports({
        page: 0,
        size: 6,
        sortBy: "createdAt",
        sortDir: "desc",
      });

      setRecentReports(response.data.content);

      // Calculate stats (this is a simplified version)
      const reports = response.data.content;
      setStats({
        total: response.data.totalElements || reports.length,
        resolved: reports.filter((r) => r.status === "RESOLVED").length,
        inProgress: reports.filter((r) => r.status === "IN_PROGRESS").length,
        submitted: reports.filter((r) => r.status === "SUBMITTED").length,
      });
    } catch (error) {
      console.error("Error fetching recent reports:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {DEMO_MODE && (
        <div className="bg-blue-100 border border-blue-300 px-4 py-3 rounded-lg mb-6 mx-6 mt-6">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-blue-800 font-medium">Demo Mode</p>
              <p className="text-blue-700 text-sm">
                This is a demonstration version with sample data. The backend
                service is not available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Report. Track. Resolve.</h1>
          <p className="hero-subtitle">
            FixPoint connects citizens with local authorities to report and
            resolve civic issues in your community. Together, we can make our
            neighborhoods better.
          </p>
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/report/new" className="btn btn-primary">
                  Report an Issue
                </Link>
                <Link to="/dashboard" className="btn btn-outline">
                  View Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/map" className="btn btn-outline">
                  Explore Map
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "3rem",
              color: "#1f2937",
            }}
          >
            Platform Statistics
          </h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <AlertCircle size={32} />
              </div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Reports</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <MapPin size={32} />
              </div>
              <div className="stat-number">{stats.submitted}</div>
              <div className="stat-label">Active Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <div className="stat-number">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle size={32} />
              </div>
              <div className="stat-number">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{ background: "#f8fafc" }}>
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "3rem",
              color: "#1f2937",
            }}
          >
            How FixPoint Works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            <div className="stat-card">
              <div className="stat-icon">
                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  1
                </span>
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#1f2937",
                }}
              >
                Report Issues
              </h3>
              <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                Easily report civic problems in your area with photos,
                descriptions, and precise location mapping.
              </p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  2
                </span>
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#1f2937",
                }}
              >
                Track Progress
              </h3>
              <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                Monitor the status of your reports and receive updates as local
                authorities work on solutions.
              </p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  3
                </span>
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#1f2937",
                }}
              >
                See Results
              </h3>
              <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                View resolved issues and see the positive impact of community
                engagement in your neighborhood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="py-16 bg-white">
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "3rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#1f2937",
              }}
            >
              Recent Reports
            </h2>
            <Link to="/map" className="btn btn-outline">
              View All on Map
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
                Loading recent reports...
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "2rem",
                }}
              >
                {recentReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>

              {recentReports.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "1.1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    No reports available yet.
                  </p>
                  {user && (
                    <Link to="/report/new" className="btn btn-primary">
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
        <section
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                marginBottom: "1rem",
              }}
            >
              Ready to Make a Difference?
            </h2>
            <p
              style={{
                fontSize: "1.25rem",
                marginBottom: "2rem",
                opacity: "0.9",
                lineHeight: "1.6",
              }}
            >
              Join thousands of citizens working together to improve their
              communities.
            </p>
            <Link
              to="/register"
              className="btn btn-primary"
              style={{
                background: "white",
                color: "#667eea",
                fontSize: "1.1rem",
                padding: "1rem 2rem",
              }}
            >
              Sign Up Today
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
