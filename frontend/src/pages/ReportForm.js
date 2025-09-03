import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  MapPin,
  Save,
  ChevronDown,
  Sparkles,
  Edit3,
  Languages,
} from "lucide-react";
import { reportService } from "../services/reportService";
import { ISSUE_CATEGORIES } from "../services/categorizationService";
import DuplicateWarningModal from "../components/DuplicateWarningModal";
import OrganizationSelector from "../components/OrganizationSelector";
import VolunteerNotification from "../components/VolunteerNotification";
import AIDescriptionGenerator from "../components/AIDescriptionGenerator";
import EnhancedAIDescriptionGenerator from "../components/EnhancedAIDescriptionGenerator";
import SimpleAIDescriptionGenerator from "../components/SimpleAIDescriptionGenerator";
import "../components/SimpleAIDescriptionGenerator.css";
import EnhancedLocationPicker from "../components/EnhancedLocationPicker";
import ImageUploader from "../components/ImageUploader";
import CategorySelector from "../components/CategorySelector";
import "./ReportForm.css";
import "../components/EnhancedLocationPicker.css";
import TextToSpeechButton from "../components/TextToSpeechButton";

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
  const [locationAddress, setLocationAddress] = useState("");
  const [locationContext, setLocationContext] = useState({});
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState("");
  const [showAiDescription, setShowAiDescription] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [showOrganizationDropdown, setShowOrganizationDropdown] =
    useState(false);
  const [notifyVolunteers, setNotifyVolunteers] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [pendingReportData, setPendingReportData] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalDescription, setOriginalDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    ISSUE_CATEGORIES.OTHER || null
  );
  const [selectedPriority, setSelectedPriority] = useState("medium");

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "OTHER",
      priority: "MEDIUM",
      locationAddress: "",
    },
  });

  // Filter and group organizations
  const getFilteredOrganizations = () => {
    if (!organizationSearch) return organizations;

    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(organizationSearch.toLowerCase()) ||
        org.type.toLowerCase().includes(organizationSearch.toLowerCase()) ||
        org.city.toLowerCase().includes(organizationSearch.toLowerCase())
    );
  };

  const getGroupedOrganizations = () => {
    const filtered = getFilteredOrganizations();
    const grouped = filtered.reduce((groups, org) => {
      const key = org.type.replace(/_/g, " ");
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(org);
      return groups;
    }, {});

    return grouped;
  };

  const getSelectedOrganizationNames = () => {
    const selected = organizations.filter((org) =>
      selectedOrganizations.includes(org.id.toString())
    );
    return selected.map((org) => `${org.name} (${org.city})`);
  };

  const toggleOrganization = (orgId) => {
    const orgIdStr = orgId.toString();
    if (selectedOrganizations.includes(orgIdStr)) {
      setSelectedOrganizations(
        selectedOrganizations.filter((id) => id !== orgIdStr)
      );
    } else {
      setSelectedOrganizations([...selectedOrganizations, orgIdStr]);
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

  const handleAddressChange = useCallback(
    (address, addressComponents) => {
      setLocationAddress(address);
      setLocationContext(addressComponents);
      setValue("locationAddress", address);
    },
    [setValue]
  );

  const handleLocationAddressChange = useCallback(
    (address) => {
      setLocationAddress(address);
      setValue("locationAddress", address);
    },
    [setValue]
  );

  // Handlers for smart categorization
  const handleCategoryChange = useCallback(
    (category) => {
      setSelectedCategory(category);
      setValue("category", category.id);
    },
    [setValue]
  );

  const handlePriorityChange = useCallback(
    (priority) => {
      setSelectedPriority(priority); // Keep lowercase for UI
      setValue("priority", priority.toUpperCase()); // Convert to uppercase for backend
    },
    [setValue]
  );

  // Progress tracking functions
  const calculateProgress = () => {
    let progress = 0;
    const formData = getValues();

    // Step 1: Title (15%)
    if (formData.title && formData.title.trim().length > 0) progress += 15;

    // Step 2: Image (15%)
    if (selectedImage) progress += 15;

    // Step 3: Description (20%)
    if (formData.description && formData.description.trim().length > 10)
      progress += 20;

    // Step 4: Category (15%)
    if (selectedCategory || formData.category) progress += 15;

    // Step 5: Location (15%)
    if (selectedLocation && formData.latitude && formData.longitude)
      progress += 15;

    // Step 6: Organization (10%)
    if (selectedOrganizations.length > 0) progress += 10;

    // Step 7: Volunteer notification (10%)
    progress += 10; // Always completed as it has a default value

    return Math.min(progress, 100);
  };

  const getCurrentStep = () => {
    const formData = getValues();

    if (!formData.title || formData.title.trim().length === 0) return 1;
    if (!selectedImage) return 2;
    if (!formData.description || formData.description.trim().length <= 10)
      return 3;
    if (!selectedCategory && !formData.category) return 4;
    if (!selectedLocation || !formData.latitude || !formData.longitude)
      return 5;
    if (selectedOrganizations.length === 0) return 6;
    return 7;
  };

  const getCurrentStepName = () => {
    const step = getCurrentStep();
    const stepNames = {
      1: "Issue Title",
      2: "Upload Image",
      3: "Description",
      4: "Categorization",
      5: "Location",
      6: "Organizations",
      7: "Final Review",
    };
    return stepNames[step] || "Complete";
  };

  // Enhanced AI analysis with context - directly populate description field and auto-select suggestions
  const analyzeImageWithAI = async (contextData = {}) => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzingImage(true);
    try {
      const currentCategory =
        getValues("category") || contextData.category || "OTHER";

      const response = await reportService.analyzeImageEnhanced(
        selectedImage,
        currentCategory
      );
      if (response.data && response.data.description) {
        // Store original description before replacing
        const currentDescription = getValues("description");
        if (currentDescription && !originalDescription) {
          setOriginalDescription(currentDescription);
        }

        // Directly populate the description field
        setValue("description", response.data.description);
        setAiGeneratedDescription(response.data.description);
        setShowAiDescription(false); // Don't show preview, description is already in field

        // Auto-select suggested category and priority if available
        if (response.data.suggestedCategory) {
          const categoryKey = response.data.suggestedCategory.toUpperCase();
          console.log("AI suggested category:", categoryKey);

          // Find and set the category object for the UI
          const categoryObj = Object.values(ISSUE_CATEGORIES || {}).find(
            (cat) =>
              cat.id === categoryKey || cat.name.toUpperCase() === categoryKey
          );
          console.log("Found category object:", categoryObj);

          if (categoryObj) {
            setSelectedCategory(categoryObj);
            setValue("category", categoryObj.id);
            console.log("Category set to:", categoryObj.id);
          } else {
            console.warn("Category not found for:", categoryKey);
            console.log(
              "Available categories:",
              Object.values(ISSUE_CATEGORIES || {})
            );
          }
        }

        if (response.data.suggestedPriority) {
          const priority = response.data.suggestedPriority.toLowerCase(); // Lowercase for UI
          console.log("AI suggested priority:", priority);
          setValue("priority", priority.toUpperCase()); // Uppercase for backend
          setSelectedPriority(priority); // Lowercase for UI state
          console.log("Priority set to:", priority);
        }

        toast.success(
          "AI description applied and category/priority auto-selected!"
        );
      } else {
        toast.error("No description received from AI service");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image with AI");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // AI Translation function to Bangla
  const translateDescriptionToBangla = async () => {
    const currentDescription = getValues("description");
    if (!currentDescription || currentDescription.trim() === "") {
      toast.error("Please enter a description to translate");
      return;
    }

    setIsTranslating(true);
    try {
      // Store original description if not already stored
      if (!originalDescription) {
        setOriginalDescription(currentDescription);
      }

      const response = await reportService.translateText(
        currentDescription,
        "bangla"
      );
      if (response.data && response.data.translatedText) {
        setValue("description", response.data.translatedText);
        toast.success("Description translated to Bangla!");
      } else {
        toast.error("Translation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error translating text:", error);
      toast.error("Failed to translate description");
    } finally {
      setIsTranslating(false);
    }
  };

  // AI Translation function to English
  const translateDescriptionToEnglish = async () => {
    const currentDescription = getValues("description");
    if (!currentDescription || currentDescription.trim() === "") {
      toast.error("Please enter a description to translate");
      return;
    }

    setIsTranslating(true);
    try {
      const response = await reportService.translateText(
        currentDescription,
        "english"
      );
      if (response.data && response.data.translatedText) {
        setValue("description", response.data.translatedText);
        toast.success("Description translated to English!");
      } else {
        toast.error("Translation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error translating text:", error);
      toast.error("Failed to translate description");
    } finally {
      setIsTranslating(false);
    }
  };

  // Restore original description
  const restoreOriginalDescription = () => {
    if (originalDescription) {
      setValue("description", originalDescription);
      setOriginalDescription("");
      toast.success("Original description restored!");
    } else {
      toast.info("No original description to restore");
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
      if (!event.target.closest(".organization-selector")) {
        setShowOrganizationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const organizationSelector = event.target.closest(
        ".organization-selector"
      );
      if (!organizationSelector && showOrganizationDropdown) {
        setShowOrganizationDropdown(false);
        setOrganizationSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      console.log("Organizations API response:", response.data);
      // Ensure we always set an array and handle potential circular references
      if (response.data && Array.isArray(response.data)) {
        // Filter out any invalid entries and clean the data
        const cleanOrgs = response.data
          .filter((org) => org && org.id && org.name)
          .map((org) => ({
            id: org.id,
            name: org.name,
            type: org.type || "UNKNOWN",
            city: org.city || "Unknown",
            serviceAreas: org.serviceAreas || "",
            categories: org.categories || "",
            description: org.description || "",
            isActive: org.isActive !== false,
          }));
        console.log("Cleaned organizations:", cleanOrgs);
        setOrganizations(cleanOrgs);
      } else {
        console.warn("Organizations response is not an array:", response.data);
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations([]); // Set empty array on error
      // Show user-friendly error
      if (error.response?.status === 401) {
        toast.error("Please log in to view organizations");
      } else {
        toast.error("Unable to load organizations. Please try again.");
      }
    }
  };

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

  const useAIDescription = (description = aiGeneratedDescription) => {
    setValue("description", description);
    setShowAiDescription(false);
    toast.success("AI description applied! You can continue editing.");
  };

  const editAIDescription = (description = aiGeneratedDescription) => {
    setValue("description", description);
    setShowAiDescription(false);
  };

  const checkForDuplicates = async (reportData) => {
    setIsCheckingDuplicates(true);
    try {
      console.log("🔍 Checking for duplicates with data:", reportData);
      console.log("🔍 API Base URL:", process.env.REACT_APP_API_URL || 'http://localhost:8080');
      console.log("📍 Exact coordinates:", {
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        type_lat: typeof reportData.latitude,
        type_lng: typeof reportData.longitude
      });
      
      const response = await reportService.checkDuplicates(reportData);
      console.log("📋 Duplicate check response:", response.data);

      if (response.data.hasDuplicates) {
        console.log("⚠️ DUPLICATES FOUND! Count:", response.data.duplicateCount);
        console.log("📋 Duplicate details:", response.data.duplicates);
        
        setDuplicates(response.data.duplicates);
        setShowDuplicateWarning(true);
        return true;
      } else {
        console.log("✅ No duplicates found, proceeding with submission");
      }
      return false;
    } catch (error) {
      console.error("❌ Error checking for duplicates:", error);
      
      // Don't block submission if duplicate check fails
      return false;
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const proceedWithSubmission = async (
    reportData,
    skipDuplicateCheck = false
  ) => {
    setLoading(true);
    try {
      const report = await reportService.createReport(
        reportData,
        selectedImage
      );
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
    console.log("🚀 Form submission started");
    console.log("Form submission data:", data);
    console.log("Selected category:", selectedCategory);
    console.log("Selected priority:", selectedPriority);

    if (!selectedLocation) {
      toast.error("Please select a location on the map");
      return;
    }

    if (selectedOrganizations.length === 0) {
      toast.error(
        "Please select at least one organization to handle this issue"
      );
      return;
    }

    const reportData = {
      ...data,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      targetOrganizationIds: selectedOrganizations,
      notifyVolunteers: notifyVolunteers,
    };

    console.log("📋 Final report data:", reportData);
    console.log("� Coordinates being sent:", {
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      selectedLocation: selectedLocation
    });
    console.log("�🔍 About to check for duplicates...");

    // Check for duplicates first
    const hasDuplicates = await checkForDuplicates(reportData);
    console.log("🔍 Duplicate check result:", hasDuplicates);

    if (hasDuplicates) {
      console.log("⚠️ Duplicates found, storing report data and showing modal");
      // Store the report data for later submission
      setPendingReportData(reportData);
      return;
    }

    console.log("✅ No duplicates, proceeding with submission");
    // No duplicates found, proceed with submission
    await proceedWithSubmission(reportData);
  };

  // Speech-to-Text callback
  const handleSpeechToTextUpdate = (recognizedText) => {
    console.log("Speech-to-text callback received:", recognizedText);
    const currentDescription = getValues("description") || "";
    const newDescription =
      currentDescription + (currentDescription ? " " : "") + recognizedText;
    console.log("Current description:", currentDescription);
    console.log("New description:", newDescription);

    setValue("description", newDescription);

    // Force a re-render by updating the form state
    setTimeout(() => {
      const updatedValue = getValues("description");
      console.log("Updated description value:", updatedValue);
    }, 100);

    toast.success("Voice input added to description!");
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
          {/* Progress Indicator */}
          <div className="form-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="progress-text">
              Step {getCurrentStep()} of 7 - {getCurrentStepName()}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="report-form-grid">
              {/* Form Content */}
              <div className="report-form-content space-y-6">
                {/* Step 1: Basic Information */}
                <div className="form-section">
                  <div className="form-section-header">
                    <h3 className="form-section-title">
                      📝 Step 1: Issue Title
                    </h3>
                    <p className="form-section-subtitle">
                      Start with a brief, clear title for your issue
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="title" className="form-label">
                      Issue Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      className="form-input"
                      placeholder="Brief description of the issue (e.g., 'Broken streetlight on Main Road')"
                      {...register("title", {
                        required: "Title is required",
                        maxLength: {
                          value: 200,
                          message: "Title must be less than 200 characters",
                        },
                      })}
                    />
                    {errors.title && (
                      <div className="error-message">
                        {errors.title.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Image Upload and AI Analysis */}
                <div className="form-section">
                  <div className="form-section-header">
                    <h3 className="form-section-title">
                      📷 Step 2: Upload Image & AI Analysis
                    </h3>
                    <p className="form-section-subtitle">
                      Upload a photo and let AI help you describe the issue
                    </p>
                  </div>

                  <div className="form-group">
                    <ImageUploader
                      selectedImage={selectedImage}
                      imagePreview={imagePreview}
                      handleImageSelect={handleImageChange}
                    />

                    <SimpleAIDescriptionGenerator
                      selectedImage={selectedImage}
                      isAnalyzing={isAnalyzingImage}
                      onAnalyze={analyzeImageWithAI}
                      onTranslateToBangla={translateDescriptionToBangla}
                      onTranslateToEnglish={translateDescriptionToEnglish}
                      onRestoreOriginal={restoreOriginalDescription}
                      isTranslating={isTranslating}
                      currentDescription={getValues("description")}
                      originalDescription={originalDescription}
                    />
                  </div>
                </div>

                {/* Step 3: Description */}
                <div className="form-section">
                  <div className="form-section-header">
                    <h3 className="form-section-title">
                      📄 Step 3: Detailed Description
                    </h3>
                    <p className="form-section-subtitle">
                      Provide detailed information about the issue. The AI may
                      have already helped you with this!
                    </p>
                  </div>

                  <div className="form-group">
                    <div className="flex items-center justify-between mb-3">
                      <label htmlFor="description" className="form-label">
                        Description *
                      </label>
                    </div>

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
                      })}
                    />

                    {/* Text-to-Speech Controls */}
                    <div className="mt-3">
                      <TextToSpeechButton
                        text={getValues("description") || ""}
                        className="description-tts"
                        onTextUpdate={handleSpeechToTextUpdate}
                      />
                    </div>

                    {errors.description && (
                      <div className="form-error">
                        {errors.description.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4: Smart Issue Categorization */}
                <div className="form-section">
                  <div className="form-section-header">
                    <h3 className="form-section-title">
                      🤖 Step 4: AI Categorization
                    </h3>
                    <p className="form-section-subtitle">
                      Our AI will analyze your description and suggest the best
                      category and priority level
                    </p>
                  </div>

                  <CategorySelector
                    description={getValues("description") || ""}
                    imageFile={selectedImage}
                    location={locationAddress}
                    selectedCategory={selectedCategory}
                    selectedPriority={selectedPriority}
                    onCategoryChange={handleCategoryChange}
                    onPriorityChange={handlePriorityChange}
                    autoAnalyze={false}
                  />

                  {/* Hidden form fields for category and priority (for form submission) */}
                  <input
                    type="hidden"
                    {...register("category", {
                      required: "Category is required",
                    })}
                  />
                  <input type="hidden" {...register("priority")} />
                  {errors.category && (
                    <div className="form-error">{errors.category.message}</div>
                  )}
                </div>

                {/* Step 5: Location Selection */}
                <div className="form-section">
                  <div className="form-section-header">
                    <h3 className="form-section-title">
                      📍 Step 5: Select Location
                    </h3>
                    <p className="form-section-subtitle">
                      Search for a location, use your current location, or click
                      on the map to pinpoint the exact location
                    </p>
                  </div>

                  <div className="form-group">
                    <EnhancedLocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialPosition={mapPosition}
                      onAddressChange={handleAddressChange}
                      selectedLocation={selectedLocation}
                      locationAddress={locationAddress}
                      onLocationAddressChange={handleLocationAddressChange}
                    />

                    <input type="hidden" {...register("latitude")} />
                    <input type="hidden" {...register("longitude")} />
                  </div>
                </div>

                {/* Step 6: Organization Selection */}
                <div className="form-section organization-section">
                  <div className="form-section-header">
                    <h3 className="form-section-title">
                      🏢 Step 6: Select Organizations
                    </h3>
                    <p className="form-section-subtitle">
                      Choose which organizations should handle this issue
                    </p>
                  </div>

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
                </div>

                {/* Step 7: Volunteer Notification */}
                <div className="form-section">
                  <div className="form-section-header">
                    <h3 className="form-section-title">
                      🤝 Step 7: Volunteer Notification
                    </h3>
                    <p className="form-section-subtitle">
                      Choose whether to notify volunteers about this issue
                    </p>
                  </div>

                  <VolunteerNotification
                    notifyVolunteers={notifyVolunteers}
                    setNotifyVolunteers={setNotifyVolunteers}
                  />
                </div>

                {/* Submit Button */}
                <div className="form-section">
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading || isCheckingDuplicates}
                      className="btn btn-primary btn-lg flex items-center gap-3 px-8 py-3"
                    >
                      <Save size={20} />
                      {isCheckingDuplicates
                        ? "Checking for duplicates..."
                        : loading
                        ? "Submitting..."
                        : "Submit Report"}
                    </button>
                  </div>
                </div>
              </div>
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
