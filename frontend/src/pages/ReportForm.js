import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Upload, Save, Sparkles, Edit3 } from "lucide-react";
import { reportService } from "../services/reportService";

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mapPosition, setMapPosition] = useState([23.8103, 90.4125]); // Dhaka, Bangladesh
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState("");
  const [showAiDescription, setShowAiDescription] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchPriorities();
    getCurrentLocation();
  }, []);

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

  const getCurrentLocation = () => {
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

    setIsAnalyzingImage(true);
    try {
      const response = await reportService.analyzeImage(selectedImage);
      const { description, success, error } = response.data;

      if (success) {
        setAiGeneratedDescription(description);
        setShowAiDescription(true);
        toast.success(
          "AI analysis completed! You can now edit the description."
        );
      } else {
        setAiGeneratedDescription(description);
        setShowAiDescription(true);
        toast.warning(
          error ||
            "AI analysis completed with limitations. Please review and edit."
        );
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

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      toast.error("Please select a location on the map");
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        ...data,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      };

      await reportService.createReport(reportData, selectedImage);
      toast.success("Report submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatEnumValue = (value) => {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="page-title mb-8">Report New Issue</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Issue Details</h2>
            </div>
            <div className="card-body space-y-6">
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
                  <div className="form-error">{errors.title.message}</div>
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
              <div className="form-group">
                <label htmlFor="image" className="form-label">
                  Issue Photo (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <label
                      htmlFor="image"
                      className="btn btn-outline cursor-pointer"
                    >
                      Choose Image
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />

                    {/* AI Analysis Button */}
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={analyzeImageWithAI}
                        disabled={isAnalyzingImage}
                        className="btn btn-primary flex items-center space-x-2"
                      >
                        <Sparkles size={20} />
                        <span>
                          {isAnalyzingImage
                            ? "Analyzing..."
                            : "Generate Description with AI"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
              disabled={loading}
              className="btn btn-primary"
            >
              <Save size={20} className="mr-2" />
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
