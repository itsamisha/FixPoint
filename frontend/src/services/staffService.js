import api from './api';

export const staffService = {
  // Get all staff members for the current user's organization
  getOrganizationStaff: () => {
    return api.get('/api/staff/organization');
  },

  // Get staff member by ID
  getStaffById: (id) => {
    return api.get(`/api/staff/${id}`);
  },

  // Create new staff member
  createStaff: (staffData) => {
    return api.post('/api/staff', staffData);
  },

  // Update staff member
  updateStaff: (id, staffData) => {
    return api.put(`/api/staff/${id}`, staffData);
  },

  // Delete/deactivate staff member
  deleteStaff: (id) => {
    return api.delete(`/api/staff/${id}`);
  },

  // Get staff by organization ID (for admins)
  getStaffByOrganization: (organizationId) => {
    return api.get(`/api/staff/organization/${organizationId}`);
  }
};

export default staffService;
