import React, { useState, useEffect } from "react";
import { Settings, Save, Building, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./OrganizationSettings.css";

const OrganizationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    contactPhone: "",
    contactEmail: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrganizationSettings();
  }, []);

  const fetchOrganizationSettings = async () => {
    try {
      setLoading(true);
      // This would typically fetch from an organization service
      // For now, we'll use placeholder data
      setSettings({
        name: user.organization?.name || "",
        description: user.organization?.description || "",
        address: user.organization?.address || "",
        city: user.organization?.city || "",
        state: user.organization?.state || "",
        zipCode: user.organization?.zipCode || "",
        country: user.organization?.country || "",
        contactPhone: user.organization?.contactPhone || "",
        contactEmail: user.organization?.contactEmail || "",
        website: user.organization?.website || "",
      });
    } catch (error) {
      console.error("Error fetching organization settings:", error);
      toast.error("Failed to load organization settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // This would typically call an organization service to update settings
      // await organizationService.updateSettings(user.organizationId, settings);

      // For now, just show a success message
      toast.success("Organization settings updated successfully");
    } catch (error) {
      console.error("Error saving organization settings:", error);
      toast.error("Failed to save organization settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="organization-settings">
        <div className="loading-spinner">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="organization-settings">
      <div className="settings-header">
        <div className="settings-title">
          <Settings className="icon" />
          <h1>Organization Settings</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-section">
          <h2>
            <Building className="section-icon" />
            Basic Information
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Organization Name *</label>
              <input
                type="text"
                id="name"
                value={settings.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="4"
                value={settings.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Brief description of your organization..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                value={settings.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>
            <MapPin className="section-icon" />
            Address Information
          </h2>

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                value={settings.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State/Province</label>
              <input
                type="text"
                id="state"
                value={settings.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="zipCode">ZIP/Postal Code</label>
              <input
                type="text"
                id="zipCode"
                value={settings.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={settings.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>
            <Mail className="section-icon" />
            Contact Information
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                value={settings.contactEmail}
                onChange={(e) =>
                  handleInputChange("contactEmail", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">Contact Phone</label>
              <input
                type="tel"
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) =>
                  handleInputChange("contactPhone", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save className="btn-icon" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationSettings;
