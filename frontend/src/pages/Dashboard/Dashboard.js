import React, { useState, useEffect } from "react";
import { getApiBaseUrl } from "../../utils/apiConfig";
import { Link } from "react-router-dom";
import { Plus, Filter, Search } from "lucide-react";
import { toast } from "react-toastify";
import ReportCard from "../../components/ReportCard/ReportCard";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllReports();
    } else if (activeTab === "my") {
      fetchUserReports();
    }
  }, [activeTab, filters]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, statusesRes] = await Promise.all([
        reportService.getCategories(),
        reportService.getStatuses(),
      ]);
      setCategories(categoriesRes.data);
      setStatuses(statusesRes.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const params = {
        page: 0,
        size: 20,
        sortBy: "createdAt",
        sortDir: "desc",
        ...filters,
      };

      console.log("Fetching all reports with params:", params);

      // Try basic fetch first
      try {
        const url = new URL(`${getApiBaseUrl()}/api/public/reports`);
        Object.keys(params).forEach((key) => {
          if (params[key]) url.searchParams.append(key, params[key]);
        });

        console.log("Fetch URL:", url.toString());
        const fetchResponse = await fetch(url);
        console.log("Fetch Response Status:", fetchResponse.status);

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          console.log("Fetch Response Data:", data);
          setReports(data.content);
          return;
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
      }

      // Fallback to axios
      const response = await reportService.getPublicReports(params);
      console.log("All reports response:", response);
      setReports(response.data.content);
    } catch (error) {
      console.error("Error fetching reports:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.error("Error status:", error.response?.status);

      // Add test data as fallback to check if component rendering works
      console.log("Setting fallback test data");
      setReports([
        {
          id: 999,
          title: "Test Report - API Failed",
          description: "This is test data because API call failed",
          category: "ROADS_INFRASTRUCTURE",
          status: "SUBMITTED",
          priority: "HIGH",
          latitude: 23.8103,
          longitude: 90.4125,
          voteCount: 0,
          commentCount: 0,
          createdAt: new Date().toISOString(),
          reporter: { fullName: "Test User" },
        },
      ]);

      toast.error("Failed to fetch reports - showing test data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async () => {
    setLoading(true);
    try {
      const params = {
        page: 0,
        size: 20,
      };
      console.log("Fetching user reports with params:", params);
      const response = await reportService.getUserReports(params);
      console.log("User reports response:", response);
      setUserReports(response.data.content);
    } catch (error) {
      console.error("Error fetching user reports:", error);
      toast.error("Failed to fetch your reports");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId) => {
    try {
      await reportService.voteForReport(reportId);
      toast.success("Vote updated successfully");

      // Refresh reports
      if (activeTab === "all") {
        fetchAllReports();
      } else {
        fetchUserReports();
      }
    } catch (error) {
      console.error("Error voting for report:", error);
      toast.error("Failed to update vote");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      category: "",
      search: "",
    });
  };

  const formatEnumValue = (value) => {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const currentReports = activeTab === "all" ? reports : userReports;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.fullName || user?.username}!
          </p>
        </div>
        <Link to="/report/new" className="btn btn-primary">
          <Plus size={20} className="mr-2" />
          Report New Issue
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "my"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            My Reports
          </button>
        </nav>
      </div>

      {/* Filters */}
      {activeTab === "all" && (
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-4">
              <Filter size={20} />
              <h3 className="font-semibold">Filters</h3>
              <button
                onClick={clearFilters}
                className="btn btn-outline btn-sm ml-auto"
              >
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Search</label>
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="Search reports..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
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
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {formatEnumValue(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-8">
          <p>Loading reports...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onVote={handleVote}
                showVoteButton={activeTab === "all"}
              />
            ))}
          </div>

          {currentReports.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {activeTab === "all"
                  ? "No reports found matching your criteria."
                  : "You haven't reported any issues yet."}
              </p>
              {activeTab === "my" && (
                <Link to="/report/new" className="btn btn-primary">
                  Report Your First Issue
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
