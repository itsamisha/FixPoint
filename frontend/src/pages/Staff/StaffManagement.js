import React, { useState, useEffect } from "react";
import { Users, UserPlus, Mail, Phone, Shield, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { staffService } from "../../services/staffService";
import { useAuth } from "../../contexts/AuthContext";
import "./StaffManagement.css";

const StaffManagement = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: "",
    fullName: "",
    phone: "",
    jobTitle: "",
    department: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getOrganizationStaff(
        user.organizationId
      );
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await staffService.inviteStaff({
        ...newStaff,
        organizationId: user.organizationId,
      });
      toast.success("Staff invitation sent successfully");
      setShowAddModal(false);
      setNewStaff({
        email: "",
        fullName: "",
        phone: "",
        jobTitle: "",
        department: "",
      });
      fetchStaff();
    } catch (error) {
      console.error("Error inviting staff:", error);
      toast.error("Failed to send staff invitation");
    }
  };

  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) {
      return;
    }

    try {
      await staffService.removeStaff(staffId);
      toast.success("Staff member removed successfully");
      fetchStaff();
    } catch (error) {
      console.error("Error removing staff:", error);
      toast.error("Failed to remove staff member");
    }
  };

  if (loading) {
    return (
      <div className="staff-management">
        <div className="loading-spinner">Loading staff...</div>
      </div>
    );
  }

  return (
    <div className="staff-management">
      <div className="staff-header">
        <div className="staff-title">
          <Users className="icon" />
          <h1>Staff Management</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="btn-icon" />
          Add Staff Member
        </button>
      </div>

      <div className="staff-grid">
        {staff.map((member) => (
          <div key={member.id} className="staff-card">
            <div className="staff-info">
              <h3>{member.fullName}</h3>
              <p className="job-title">{member.jobTitle}</p>
              <p className="department">{member.department}</p>
              <div className="contact-info">
                <span className="contact-item">
                  <Mail className="icon" />
                  {member.email}
                </span>
                {member.phone && (
                  <span className="contact-item">
                    <Phone className="icon" />
                    {member.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="staff-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveStaff(member.id)}
              >
                <Trash2 className="btn-icon" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="empty-state">
          <Users className="empty-icon" />
          <h3>No Staff Members</h3>
          <p>
            Add staff members to help manage reports and organization tasks.
          </p>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Staff Member</h2>
            <form onSubmit={handleAddStaff}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newStaff.fullName}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, phone: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={newStaff.jobTitle}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, jobTitle: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={newStaff.department}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, department: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
