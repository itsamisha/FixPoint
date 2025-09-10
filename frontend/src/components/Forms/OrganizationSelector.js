import React from 'react';
import { Building2, ChevronDown } from "lucide-react";

const OrganizationSelector = ({
  organizations,
  selectedOrganizations,
  setSelectedOrganizations,
  organizationSearch,
  setOrganizationSearch,
  showOrganizationDropdown,
  setShowOrganizationDropdown,
  getFilteredOrganizations,
  getGroupedOrganizations,
  getSelectedOrganizationNames,
  formatEnumValue
}) => {
  const toggleOrganization = (orgId) => {
    const orgIdStr = orgId.toString();
    if (selectedOrganizations.includes(orgIdStr)) {
      setSelectedOrganizations(selectedOrganizations.filter(id => id !== orgIdStr));
    } else {
      setSelectedOrganizations([...selectedOrganizations, orgIdStr]);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        Target Organizations *
      </label>
      <div className="form-help mb-3">
        Select which organizations should handle this issue
      </div>

      {/* Selected Organizations Display */}
      {selectedOrganizations.length > 0 && (
        <div className="selected-organizations">
          <div className="selected-organizations-label">Selected Organizations:</div>
          <div className="selected-organizations-list">
            {getSelectedOrganizationNames().map((name, index) => (
              <span key={index} className="selected-organization-tag">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="organization-selector">
        <div className="organization-input-wrapper">
          <input
            type="text"
            placeholder="Search organizations by name, type, or city..."
            className="form-input organization-search"
            value={organizationSearch}
            onChange={(e) => setOrganizationSearch(e.target.value)}
            onFocus={() => setShowOrganizationDropdown(true)}
          />
          <button
            type="button"
            className="organization-dropdown-toggle"
            onClick={() => setShowOrganizationDropdown(!showOrganizationDropdown)}
          >
            <Building2 size={18} className="mr-2" />
            <ChevronDown size={16} />
          </button>
        </div>

        {showOrganizationDropdown && (
          <div className="organization-dropdown">
            {getFilteredOrganizations().length === 0 ? (
              <div className="no-organizations">
                {organizationSearch ? 'No organizations found matching your search.' : 'No organizations available.'}
              </div>
            ) : (
              Object.entries(getGroupedOrganizations()).map(([type, orgs]) => (
                <div key={type} className="organization-group">
                  <div className="organization-group-header">
                    {formatEnumValue(type)} ({orgs.length})
                  </div>
                  {orgs.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      className={`organization-option ${
                        selectedOrganizations.includes(org.id.toString()) ? 'selected' : ''
                      }`}
                      onClick={() => toggleOrganization(org.id)}
                    >
                      <div className="organization-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedOrganizations.includes(org.id.toString())}
                          onChange={() => {}}
                          className="organization-checkbox-input"
                        />
                      </div>
                      <div className="organization-details">
                        <div className="organization-name">{org.name}</div>
                        <div className="organization-info">
                          <span className="organization-type">{formatEnumValue(org.type)}</span>
                          <span className="organization-city">{org.city}</span>
                        </div>
                        {org.description && (
                          <div className="organization-description">{org.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSelector;
