import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState("citizen");
  const [organizations, setOrganizations] = useState([]);
  const [organizationTypes, setOrganizationTypes] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  useEffect(() => {
    if (registrationType === "organization_staff") {
      fetchOrganizations();
    }
    if (registrationType === "organization") {
      fetchOrganizationTypes();
    }
  }, [registrationType]);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get("/api/organizations");
      setOrganizations(response.data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchOrganizationTypes = async () => {
    try {
      const response = await api.get("/api/organizations/types");
      setOrganizationTypes(response.data);
    } catch (error) {
      console.error("Error fetching organization types:", error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let result;

      if (registrationType === "organization") {
        // Register organization with admin user
        result = await api.post("/api/auth/signup-organization", {
          // Organization details
          name: data.organizationName,
          description: data.organizationDescription,
          type: data.organizationType,
          address: data.organizationAddress,
          city: data.organizationCity,
          state: data.organizationState,
          zipCode: data.organizationZipCode,
          country: data.organizationCountry || "Bangladesh",
          contactPhone: data.organizationPhone,
          contactEmail: data.organizationEmail,
          website: data.organizationWebsite,
          serviceAreas: data.serviceAreas,
          categories: data.categories,
          // Admin user details
          adminUsername: data.username,
          adminFullName: data.fullName,
          adminEmail: data.email,
          adminPassword: data.password,
          confirmPassword: data.confirmPassword,
          adminPhone: data.phone,
          adminJobTitle: data.jobTitle,
          adminDepartment: data.department,
        });

        if (result.status === 200) {
          toast.success("Organization registered successfully! Please log in.");
          navigate("/login");
        }
      } else {
        // Regular user registration
        const userData = {
          ...data,
          userType:
            registrationType === "citizen"
              ? "CITIZEN"
              : registrationType === "organization_staff"
              ? "ORGANIZATION_STAFF"
              : "VOLUNTEER",
        };

        result = await registerUser(userData);
        if (result.success) {
          toast.success("Registration successful! Please log in.");
          navigate("/login");
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            {/* Registration Type Selection */}
            <div className="form-group mb-6">
              <label className="form-label">Registration Type</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="citizen"
                    checked={registrationType === "citizen"}
                    onChange={(e) => setRegistrationType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Citizen</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="organization_staff"
                    checked={registrationType === "organization_staff"}
                    onChange={(e) => setRegistrationType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Organization Staff Member</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="organization"
                    checked={registrationType === "organization"}
                    onChange={(e) => setRegistrationType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Register New Organization</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Organization Information (only for organization registration) */}
              {registrationType === "organization" && (
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Organization Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="organizationName" className="form-label">
                        Organization Name *
                      </label>
                      <input
                        id="organizationName"
                        type="text"
                        className="form-input"
                        {...register("organizationName", {
                          required:
                            registrationType === "organization"
                              ? "Organization name is required"
                              : false,
                        })}
                      />
                      {errors.organizationName && (
                        <div className="form-error">
                          {errors.organizationName.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="organizationType" className="form-label">
                        Organization Type *
                      </label>
                      <select
                        id="organizationType"
                        className="form-input"
                        {...register("organizationType", {
                          required:
                            registrationType === "organization"
                              ? "Organization type is required"
                              : false,
                        })}
                      >
                        <option value="">Select Type</option>
                        {organizationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                      {errors.organizationType && (
                        <div className="form-error">
                          {errors.organizationType.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="organizationDescription"
                      className="form-label"
                    >
                      Description
                    </label>
                    <textarea
                      id="organizationDescription"
                      rows="3"
                      className="form-input"
                      {...register("organizationDescription")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="organizationEmail" className="form-label">
                        Contact Email *
                      </label>
                      <input
                        id="organizationEmail"
                        type="email"
                        className="form-input"
                        {...register("organizationEmail", {
                          required:
                            registrationType === "organization"
                              ? "Contact email is required"
                              : false,
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />
                      {errors.organizationEmail && (
                        <div className="form-error">
                          {errors.organizationEmail.message}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="organizationPhone" className="form-label">
                        Contact Phone
                      </label>
                      <input
                        id="organizationPhone"
                        type="tel"
                        className="form-input"
                        {...register("organizationPhone")}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="organizationAddress" className="form-label">
                      Address
                    </label>
                    <input
                      id="organizationAddress"
                      type="text"
                      className="form-input"
                      {...register("organizationAddress")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label htmlFor="organizationCity" className="form-label">
                        City
                      </label>
                      <input
                        id="organizationCity"
                        type="text"
                        className="form-input"
                        {...register("organizationCity")}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="organizationState" className="form-label">
                        State/Division
                      </label>
                      <input
                        id="organizationState"
                        type="text"
                        className="form-input"
                        {...register("organizationState")}
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="organizationZipCode"
                        className="form-label"
                      >
                        Zip Code
                      </label>
                      <input
                        id="organizationZipCode"
                        type="text"
                        className="form-input"
                        {...register("organizationZipCode")}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="organizationWebsite" className="form-label">
                      Website
                    </label>
                    <input
                      id="organizationWebsite"
                      type="url"
                      className="form-input"
                      {...register("organizationWebsite")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="serviceAreas" className="form-label">
                        Service Areas (comma-separated)
                      </label>
                      <input
                        id="serviceAreas"
                        type="text"
                        className="form-input"
                        placeholder="e.g., Dhaka, Chittagong, Sylhet"
                        {...register("serviceAreas")}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="categories" className="form-label">
                        Service Categories (comma-separated)
                      </label>
                      <input
                        id="categories"
                        type="text"
                        className="form-input"
                        placeholder="e.g., Roads, Water, Sanitation"
                        {...register("categories")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="border-b pb-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {registrationType === "organization"
                    ? "Admin User Information"
                    : "Personal Information"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className="form-input"
                      {...register("fullName", {
                        required: "Full name is required",
                      })}
                    />
                    {errors.fullName && (
                      <div className="form-error">
                        {errors.fullName.message}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="username" className="form-label">
                      Username *
                    </label>
                    <input
                      id="username"
                      type="text"
                      className="form-input"
                      {...register("username", {
                        required: "Username is required",
                        minLength: {
                          value: 3,
                          message: "Username must be at least 3 characters",
                        },
                      })}
                    />
                    {errors.username && (
                      <div className="form-error">
                        {errors.username.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="form-error">{errors.email.message}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-input"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    {errors.password && (
                      <div className="form-error">
                        {errors.password.message}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-input"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                    />
                    {errors.confirmPassword && (
                      <div className="form-error">
                        {errors.confirmPassword.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="form-input"
                      {...register("phone")}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      className="form-input"
                      {...register("address")}
                    />
                  </div>
                </div>

                {/* Organization-specific fields */}
                {(registrationType === "organization" ||
                  registrationType === "organization_staff") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="jobTitle" className="form-label">
                        Job Title
                      </label>
                      <input
                        id="jobTitle"
                        type="text"
                        className="form-input"
                        {...register("jobTitle")}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="department" className="form-label">
                        Department
                      </label>
                      <input
                        id="department"
                        type="text"
                        className="form-input"
                        {...register("department")}
                      />
                    </div>
                  </div>
                )}

                {/* Organization selection for staff */}
                {registrationType === "organization_staff" && (
                  <div className="form-group">
                    <label htmlFor="organizationId" className="form-label">
                      Select Organization *
                    </label>
                    <select
                      id="organizationId"
                      className="form-input"
                      {...register("organizationId", {
                        required:
                          registrationType === "organization_staff"
                            ? "Please select an organization"
                            : false,
                      })}
                    >
                      <option value="">Select Organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} - {org.city}
                        </option>
                      ))}
                    </select>
                    {errors.organizationId && (
                      <div className="form-error">
                        {errors.organizationId.message}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Volunteer Section (only for citizens) */}
              {registrationType === "citizen" && (
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Volunteer Information (Optional)
                  </h3>

                  <div className="form-group">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        {...register("isVolunteer")}
                      />
                      <span className="form-label mb-0">
                        I want to volunteer to help resolve issues
                      </span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="volunteerSkills" className="form-label">
                      Skills & Expertise (if volunteering)
                    </label>
                    <textarea
                      id="volunteerSkills"
                      rows="3"
                      className="form-input"
                      placeholder="e.g., Plumbing, Electrical work, Community organizing..."
                      {...register("volunteerSkills")}
                    />
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary"
                >
                  {loading
                    ? "Creating account..."
                    : registrationType === "organization"
                    ? "Register Organization"
                    : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
