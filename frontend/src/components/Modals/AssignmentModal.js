import React, { useState, useEffect } from "react";
import { X, User, Users } from "lucide-react";
import { staffService } from "../../services/staffService";
import { toast } from "react-toastify";

const AssignmentModal = ({ isOpen, onClose, report, onAssign }) => {
  const [staff, setStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await staffService.getOrganizationStaff();
      console.log("Fetched staff:", response.data);
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    setAssigning(true);
    try {
      await onAssign(report.id, selectedStaffId);
      toast.success("Report assigned successfully");
      onClose();
      setSelectedStaffId("");
    } catch (error) {
      console.error("Error assigning report:", error);
      toast.error("Failed to assign report");
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedStaffId("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex justify-between items-center">
            <h3 className="modal-title">Assign Report to Staff</h3>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Report Details</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">{report?.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                {report?.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`report-status status-${report?.status
                    ?.toLowerCase()
                    ?.replace("_", "-")}`}
                >
                  {report?.status?.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Select Staff Member
            </h4>
            {loading ? (
              <div className="loading-container py-8">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading staff members...</p>
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No staff members available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {staff
                  .filter((member) => member.isActive)
                  .map((member) => (
                    <label
                      key={member.id}
                      className={`staff-option ${
                        selectedStaffId === member.id ? "selected" : ""
                      }`}
                      onClick={(e) => {
                        console.log("Label clicked:", member.id);
                        setSelectedStaffId(member.id);
                      }}
                    >
                      <input
                        type="radio"
                        name="selectedStaff"
                        value={member.id}
                        checked={selectedStaffId === member.id}
                        onChange={(e) => {
                          console.log("Radio changed:", e.target.value);
                          setSelectedStaffId(e.target.value);
                        }}
                        style={{ marginRight: "12px" }}
                      />
                      <div className="staff-avatar">
                        {member.fullName
                          ? member.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : member.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {member.fullName || member.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.jobTitle && `${member.jobTitle}`}
                          {member.department && ` • ${member.department}`}
                          {member.employeeId && ` • ID: ${member.employeeId}`}
                        </div>
                        {member.email && (
                          <div className="text-sm text-gray-500 mt-1">
                            {member.email}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={handleClose}
            className="btn btn-outline"
            disabled={assigning}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="btn btn-primary"
            disabled={!selectedStaffId || assigning || staff.length === 0}
          >
            {assigning ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                Assigning...
              </>
            ) : (
              <>
                <User className="btn-icon" />
                Assign Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
