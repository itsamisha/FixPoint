import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Search, MapPin, Navigation, Target } from 'lucide-react';
import { toast } from "react-toastify";

const LocationSearchMarker = ({ onLocationSelect, position, onAddressUpdate }) => {
  const map = useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      // Reverse geocoding to get address
      reverseGeocode(e.latlng.lat, e.latlng.lng, onAddressUpdate);
    },
  });

  useEffect(() => {
    if (position && map) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

// Function to reverse geocode coordinates to address
const reverseGeocode = async (lat, lng, onAddressUpdate) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    const data = await response.json();
    if (data && data.display_name) {
      onAddressUpdate(data.display_name, data.address || {});
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
  }
};

// Function to search for places
const searchPlaces = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

const EnhancedLocationPicker = ({ 
  onLocationSelect, 
  initialPosition, 
  onAddressChange,
  selectedLocation,
  locationAddress,
  onLocationAddressChange 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapPosition, setMapPosition] = useState(initialPosition || [23.8103, 90.4125]);
  const [manualAddress, setManualAddress] = useState(locationAddress || '');
  const [resolvedAddress, setResolvedAddress] = useState('');

  const handleSearch = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPlaces(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      toast.error('Error searching for location');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleSearchResultSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapPosition([lat, lng]);
    onLocationSelect(lat, lng);
    setSearchQuery(result.display_name);
    setResolvedAddress(result.display_name);
    setShowSearchResults(false);
    
    // Update the manual address field with the selected address
    setManualAddress(result.display_name);
    onLocationAddressChange(result.display_name);
    onAddressChange(result.display_name, result.address || {});
  };

  const handleAddressUpdate = useCallback((address, addressComponents) => {
    setResolvedAddress(address);
    // Always update the manual address when map is clicked
    setManualAddress(address);
    onLocationAddressChange(address);
    onAddressChange(address, addressComponents);
  }, [onLocationAddressChange, onAddressChange]);

  const handleManualAddressChange = (e) => {
    const value = e.target.value;
    setManualAddress(value);
    onLocationAddressChange(value);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapPosition([latitude, longitude]);
          onLocationSelect(latitude, longitude);
          reverseGeocode(latitude, longitude, handleAddressUpdate);
          toast.success("Current location selected!");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get your current location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  return (
    <div className="enhanced-location-picker">
      {/* Search Section */}
      <div className="location-search-section">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search for a location (e.g., 'Dhaka University', 'Gulshan Circle')"
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="location-search-input"
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            className="current-location-btn"
            title="Use my current location"
          >
            <Navigation size={16} />
          </button>
        </div>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => handleSearchResultSelect(result)}
              >
                <MapPin size={16} className="result-icon" />
                <div className="result-content">
                  <div className="result-name">{result.display_name}</div>
                  <div className="result-type">{result.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="search-loading">
            <div className="search-spinner"></div>
            Searching...
          </div>
        )}
      </div>

      {/* Manual Address Input */}
      <div className="manual-address-section">
        <label className="address-label">
          Location Address
        </label>
        <input
          type="text"
          placeholder="Enter or edit the address manually"
          value={manualAddress}
          onChange={handleManualAddressChange}
          className="manual-address-input"
        />
        <p className="address-help">
          You can search above or click on the map to select a location, then edit the address here
        </p>
      </div>

      {/* Map */}
      <div className="map-container">
        <div className="map-instructions">
          <Target size={16} />
          Click on the map to pinpoint the exact location
        </div>
        <MapContainer
          center={mapPosition}
          zoom={15}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSearchMarker
            onLocationSelect={onLocationSelect}
            position={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null}
            onAddressUpdate={handleAddressUpdate}
          />
        </MapContainer>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="selected-location-display">
          <div className="location-coordinates">
            <MapPin size={16} />
            <span>
              Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </span>
          </div>
          {resolvedAddress && (
            <div className="resolved-address">
              <strong>Detected Address:</strong> {resolvedAddress}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedLocationPicker;
