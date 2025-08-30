import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Save, ChevronDown, Sparkles, Edit3 } from "lucide-react";
import { reportService } from "../services/reportService";
import DuplicateWarningModal from "../components/DuplicateWarningModal";
import OrganizationSelector from "../components/OrganizationSelector";
import VolunteerNotification from "../components/VolunteerNotification";
import AIDescriptionGenerator from "../components/AIDescriptionGenerator";
import ImageUploader from "../components/ImageUploader";
import "./ReportForm.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);

  const map = useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position && map) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

const ReportForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mapPosition, setMapPosition] = useState([23.8103, 90.4125]); // Dhaka, Bangladesh
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState("");
  const [showAiDescription, setShowAiDescription] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [showOrganizationDropdown, setShowOrganizationDropdown] = useState(false);
  const [notifyVolunteers, setNotifyVolunteers] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [pendingReportData, setPendingReportData] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  // Filter and group organizations
  const getFilteredOrganizations = () => {
    if (!organizationSearch) return organizations;
    
    return organizations.filter(org => 
      org.name.toLowerCase().includes(organizationSearch.toLowerCase()) ||
      org.type.toLowerCase().includes(organizationSearch.toLowerCase()) ||
      org.city.toLowerCase().includes(organizationSearch.toLowerCase())
    );
  };

  const getGroupedOrganizations = () => {
    const filtered = getFilteredOrganizations();
    const grouped = filtered.reduce((groups, org) => {
      const key = org.type.replace(/_/g, ' ');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(org);
      return groups;
    }, {});
    
    return grouped;
  };

  const getSelectedOrganizationNames = () => {
    const selected = organizations.filter(org => selectedOrganizations.includes(org.id.toString()));
    return selected.map(org => `${org.name} (${org.city})`);
  };

  const toggleOrganization = (orgId) => {
    const orgIdStr = orgId.toString();
    if (selectedOrganizations.includes(orgIdStr)) {
      setSelectedOrganizations(selectedOrganizations.filter(id => id !== orgIdStr));
    } else {
      setSelectedOrganizations([...selectedOrganizations, orgIdStr]);
    }
  };

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapPosition([latitude, longitude]);
          setSelectedLocation({ lat: latitude, lng: longitude });
          setValue("latitude", latitude);
          setValue("longitude", longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.info("Please select your location on the map");
        }
      );
    }
  }, [setValue]);

  useEffect(() => {
    fetchCategories();
    fetchPriorities();
    fetchOrganizations();
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.organization-selector')) {
        setShowOrganizationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const organizationSelector = event.target.closest('.organization-selector');
      if (!organizationSelector && showOrganizationDropdown) {
        setShowOrganizationDropdown(false);
        setOrganizationSearch("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOrganizationDropdown]);

  const fetchCategories = async () => {
    try {
      const response = await reportService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await reportService.getPriorities();
      setPriorities(response.data);
    } catch (error) {
      console.error("Error fetching priorities:", error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await reportService.getOrganizations();
      console.log('Organizations API response:', response.data);
      // Ensure we always set an array and handle potential circular references
      if (response.data && Array.isArray(response.data)) {
        // Filter out any invalid entries and clean the data
        const cleanOrgs = response.data
          .filter(org => org && org.id && org.name)
          .map(org => ({
            id: org.id,
            name: org.name,
            type: org.type || 'UNKNOWN',
            city: org.city || 'Unknown',
            serviceAreas: org.serviceAreas || '',
            categories: org.categories || '',
            description: org.description || '',
            isActive: org.isActive !== false
          }));
        console.log('Cleaned organizations:', cleanOrgs);
        setOrganizations(cleanOrgs);
      } else {
        console.warn('Organizations response is not an array:', response.data);
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]); // Set empty array on error
      // Show user-friendly error
      if (error.response?.status === 401) {
        toast.error('Please log in to view organizations');
      } else {
        toast.error('Unable to load organizations. Please try again.');
      }
    }
  };

  const handleLocationSelect = useCallback(
    (lat, lng) => {
      setSelectedLocation({ lat, lng });
      setValue("latitude", lat);
      setValue("longitude", lng);
    },
    [setValue]
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("Image size should be less than 10MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Reset AI description when new image is selected
      setAiGeneratedDescription("");
      setShowAiDescription(false);
    }
  };

  const analyzeImageWithAI = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    // Get current category for enhanced analysis
    const currentCategory = getValues("category");
    if (!currentCategory) {
      toast.warning("Please select a category first for better AI analysis");
      return;
    }

    setIsAnalyzingImage(true);
    try {
      // Try enhanced AI analysis first
      const response = await reportService.analyzeImageEnhanced(selectedImage, currentCategory);
      const { success, description, suggestedPriority, enhancedFeatures, error } = response.data;

      if (success) {
        setAiGeneratedDescription(description);
        setValue("description", description);
        
        // Set suggested priority if available
        if (suggestedPriority && suggestedPriority !== "MEDIUM") {
          setValue("priority", suggestedPriority);
        }
        
        setShowAiDescription(false);
        
        if (enhancedFeatures?.categorySpecific) {
          toast.success(
            `Enhanced AI analysis completed! Category-specific description generated with priority suggestion: ${suggestedPriority}`
          );
        } else if (enhancedFeatures?.fallbackUsed) {
          toast.warning(
            "Enhanced AI unavailable, used basic analysis. Please review the description."
          );
        } else {
          toast.success("AI analysis completed! Description has been added to the form.");
        }
      } else {
        // Fallback to basic AI service
        const fallbackResponse = await reportService.analyzeImage(selectedImage);
        const { description: fallbackDesc, success: fallbackSuccess } = fallbackResponse.data;
        
        if (fallbackSuccess) {
          setAiGeneratedDescription(fallbackDesc);
          setValue("description", fallbackDesc);
          setShowAiDescription(false);
          toast.warning("Enhanced AI failed, used basic analysis. Please review the description.");
        } else {
          throw new Error(error || "AI analysis failed");
        }
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error(
        "Failed to analyze image. Please try again or write description manually."
      );
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const useAIDescription = () => {
    setValue("description", aiGeneratedDescription);
    setShowAiDescription(false);
    toast.success("AI description applied! You can continue editing.");
  };

  const editAIDescription = () => {
    setValue("description", aiGeneratedDescription);
    setShowAiDescription(false);
  };

  const checkForDuplicates = async (reportData) => {
    setIsCheckingDuplicates(true);
    try {
      console.log('Checking for duplicates with data:', reportData);
      const response = await reportService.checkDuplicates(reportData);
      console.log('Duplicate check response:', response.data);
      
      if (response.data.hasDuplicates) {
        setDuplicates(response.data.duplicates);
        setShowDuplicateWarning(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      // Don't block submission if duplicate check fails
      return false;
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const proceedWithSubmission = async (reportData, skipDuplicateCheck = false) => {
    setLoading(true);
    try {
      const report = await reportService.createReport(reportData, selectedImage);
      toast.success("Report submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      toast.error("Please select a location on the map");
      return;
    }

    if (selectedOrganizations.length === 0) {
      toast.error("Please select at least one organization to handle this issue");
      return;
    }

    const reportData = {
      ...data,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      targetOrganizationIds: selectedOrganizations,
      notifyVolunteers: notifyVolunteers,
    };

    // Check for duplicates first
    const hasDuplicates = await checkForDuplicates(reportData);
    
    if (hasDuplicates) {
      // Store the report data for later submission
      setPendingReportData(reportData);
      return;
    }

    // No duplicates found, proceed with submission
    await proceedWithSubmission(reportData);
  };

  const formatEnumValue = (value) => {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="report-form-container">
      <div className="report-form-wrapper">
        {/* Header */}
        <div className="report-form-header">
          <h1 className="report-form-title">Report New Issue</h1>
          <p className="report-form-subtitle">
            Help improve your community by reporting issues that need attention
          </p>
        </div>

        {/* Main Form Card */}
        <div className="report-form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="report-form-grid">
            {/* Form Content */}
            <div className="report-form-content">
                {/* Basic Information */}
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Issue Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="Brief description of the issue"
                    {...register("title", {
                      required: "Title is required",
                      maxLength: {
                        value: 200,
                        message: "Title must be less than 200 characters",
                      },
                    })}
                  />
                  {errors.title && (
                    <div className="error-message">{errors.title.message}</div>
                  )}
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    id="category"
                    className="form-select"
                    {...register("category", {
                      required: "Category is required",
                    })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {formatEnumValue(category)}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <div className="form-error">{errors.category.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="priority" className="form-label">
                    Priority
                  </label>
                  <select
                    id="priority"
                    className="form-select"
                    {...register("priority")}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {formatEnumValue(priority)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organization Selection */}
              <OrganizationSelector
                organizations={organizations}
                selectedOrganizations={selectedOrganizations}
                setSelectedOrganizations={setSelectedOrganizations}
                organizationSearch={organizationSearch}
                setOrganizationSearch={setOrganizationSearch}
                showOrganizationDropdown={showOrganizationDropdown}
                setShowOrganizationDropdown={setShowOrganizationDropdown}
                getFilteredOrganizations={getFilteredOrganizations}
                getGroupedOrganizations={getGroupedOrganizations}
                getSelectedOrganizationNames={getSelectedOrganizationNames}
                formatEnumValue={formatEnumValue}
              />

              {/* Volunteer Option */}
              <VolunteerNotification 
                notifyVolunteers={notifyVolunteers}
                setNotifyVolunteers={setNotifyVolunteers}
              />

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description *
                </label>

                {/* AI Generated Description Preview */}
                {showAiDescription && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-800 flex items-center">
                        <Sparkles size={16} className="mr-2" />
                        AI Generated Description
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={useAIDescription}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          Use This
                        </button>
                        <button
                          type="button"
                          onClick={editAIDescription}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center"
                        >
                          <Edit3 size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAiDescription(false)}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {aiGeneratedDescription}
                    </p>
                  </div>
                )}

                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Provide detailed information about the issue..."
                  rows={5}
                  {...register("description", {
                    required: "Description is required",
                    maxLength: {
                      value: 2000,
                      message: "Description must be less than 2000 characters",
                    },
                  })}
                />
                {errors.description && (
                  <div className="form-error">{errors.description.message}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="locationAddress" className="form-label">
                  Location Address (Optional)
                </label>
                <input
                  id="locationAddress"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Near City Hall, Main Street"
                  {...register("locationAddress")}
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upload Image</h2>
            </div>
            <div className="card-body">
              <ImageUploader 
                selectedImage={selectedImage}
                imagePreview={imagePreview}
                handleImageSelect={handleImageChange}
              />
              
              <AIDescriptionGenerator
                selectedImage={selectedImage}
                isAnalyzingImage={isAnalyzingImage}
                aiGeneratedDescription={aiGeneratedDescription}
                showAiDescription={showAiDescription}
                analyzeImageWithAI={analyzeImageWithAI}
                useAIDescription={useAIDescription}
                editAIDescription={editAIDescription}
              />
            </div>
          </div>

          {/* Location Selection */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Select Location</h2>
              <p className="text-sm text-gray-600">
                Click on the map to pinpoint the exact location of the issue
              </p>
            </div>
            <div className="card-body">
              <div className="map-container mb-4">
                <MapContainer
                  center={mapPosition}
                  zoom={15}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialPosition={
                      selectedLocation
                        ? [selectedLocation.lat, selectedLocation.lng]
                        : null
                    }
                  />
                </MapContainer>
              </div>

              {selectedLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>
                    Selected: {selectedLocation.lat.toFixed(6)},{" "}
                    {selectedLocation.lng.toFixed(6)}
                  </span>
                </div>
              )}

              <input type="hidden" {...register("latitude")} />
              <input type="hidden" {...register("longitude")} />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || isCheckingDuplicates}
              className="btn btn-primary"
            >
              <Save size={20} className="mr-2" />
              {isCheckingDuplicates ? "Checking for duplicates..." : loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
        </div>
      </div>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        show={showDuplicateWarning}
        duplicates={duplicates}
        onCancel={() => {
          setShowDuplicateWarning(false);
          setDuplicates([]);
          setPendingReportData(null);
        }}
        onProceed={async () => {
          setShowDuplicateWarning(false);
          setDuplicates([]);
          if (pendingReportData) {
            await proceedWithSubmission(pendingReportData, true);
            setPendingReportData(null);
          }
        }}
        loading={loading}
        formatEnumValue={formatEnumValue}
      />
    </div>
  );
};

export default ReportForm;
