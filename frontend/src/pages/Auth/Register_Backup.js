import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState("citizen");
  const [organizations, setOrganizations] = useState([]);
  const [organizationTypes, setOrganizationTypes] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join FixPoint
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Help build a better community by reporting and resolving civic
            issues
          </p>
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Registration Type Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Choose Your Registration Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Citizen Card */}
            <div
              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
                registrationType === "citizen"
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => setRegistrationType("citizen")}
            >
              <div className="flex flex-col items-center text-center">
                <UserIcon
                  className={`h-8 w-8 mb-3 ${
                    registrationType === "citizen"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Citizen
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Report civic issues in your community and track their
                  resolution
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Submit reports with photos & location
                  <br />
                  ✓ Track issue status
                  <br />
                  ✓ Vote on community issues
                  <br />✓ Optional volunteering
                </div>
              </div>
              {registrationType === "citizen" && (
                <CheckCircleIcon className="absolute top-3 right-3 h-6 w-6 text-blue-600" />
              )}
            </div>

            {/* Organization Staff Card */}
            <div
              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
                registrationType === "organization_staff"
                  ? "border-green-500 bg-green-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => setRegistrationType("organization_staff")}
            >
              <div className="flex flex-col items-center text-center">
                <UserGroupIcon
                  className={`h-8 w-8 mb-3 ${
                    registrationType === "organization_staff"
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Organization Staff
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Join an existing organization to help resolve community issues
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Manage assigned reports
                  <br />
                  ✓ Update issue status
                  <br />
                  ✓ Communicate with citizens
                  <br />✓ Organization dashboard access
                </div>
              </div>
              {registrationType === "organization_staff" && (
                <CheckCircleIcon className="absolute top-3 right-3 h-6 w-6 text-green-600" />
              )}
            </div>

            {/* New Organization Card */}
            <div
              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
                registrationType === "organization"
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => setRegistrationType("organization")}
            >
              <div className="flex flex-col items-center text-center">
                <BuildingOfficeIcon
                  className={`h-8 w-8 mb-3 ${
                    registrationType === "organization"
                      ? "text-purple-600"
                      : "text-gray-400"
                  }`}
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  New Organization
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Register your organization to receive and handle civic reports
                </p>
                <div className="text-xs text-gray-500">
                  ✓ Complete organization setup
                  <br />
                  ✓ Receive targeted reports
                  <br />
                  ✓ Manage organization staff
                  <br />✓ Administrative controls
                </div>
              </div>
              {registrationType === "organization" && (
                <CheckCircleIcon className="absolute top-3 right-3 h-6 w-6 text-purple-600" />
              )}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              {registrationType === "citizen" && "👤 Citizen Registration"}
              {registrationType === "organization_staff" &&
                "👥 Staff Registration"}
              {registrationType === "organization" &&
                "🏢 Organization Registration"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {registrationType === "citizen" &&
                "Create your citizen account to start reporting issues"}
              {registrationType === "organization_staff" &&
                "Join an existing organization as staff member"}
              {registrationType === "organization" &&
                "Register your organization and create admin account"}
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Organization Information (only for organization registration) */}
              {registrationType === "organization" && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <BuildingOfficeIcon className="h-6 w-6 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Organization Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="organizationName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Organization Name *
                        </label>
                        <input
                          id="organizationName"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          placeholder="Enter organization name"
                          {...register("organizationName", {
                            required:
                              registrationType === "organization"
                                ? "Organization name is required"
                                : false,
                          })}
                        />
                        {errors.organizationName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            {errors.organizationName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="organizationType"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Organization Type *
                        </label>
                        <select
                          id="organizationType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          {...register("organizationType", {
                            required:
                              registrationType === "organization"
                                ? "Organization type is required"
                                : false,
                          })}
                        >
                          <option value="">Select organization type</option>
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
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            {errors.organizationType.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="organizationEmail"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Contact Email *
                        </label>
                        <input
                          id="organizationEmail"
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          placeholder="contact@organization.com"
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
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            {errors.organizationEmail.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="organizationPhone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Contact Phone
                        </label>
                        <input
                          id="organizationPhone"
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          placeholder="+880-XXX-XXXXXX"
                          {...register("organizationPhone")}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="organizationCity"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          City
                        </label>
                        <input
                          id="organizationCity"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          placeholder="Dhaka"
                          {...register("organizationCity")}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="organizationWebsite"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Website
                        </label>
                        <input
                          id="organizationWebsite"
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          placeholder="https://www.organization.com"
                          {...register("organizationWebsite")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="organizationDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="organizationDescription"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="Brief description of your organization's mission and services..."
                      {...register("organizationDescription")}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor="serviceAreas"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Service Areas
                        <span className="text-xs text-gray-500 ml-1">
                          (comma-separated)
                        </span>
                      </label>
                      <input
                        id="serviceAreas"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="Dhaka, Chittagong, Sylhet"
                        {...register("serviceAreas")}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="categories"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Service Categories
                        <span className="text-xs text-gray-500 ml-1">
                          (comma-separated)
                        </span>
                      </label>
                      <input
                        id="categories"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="Roads, Water, Sanitation"
                        {...register("categories")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div
                className={`rounded-lg p-6 border ${
                  registrationType === "citizen"
                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
                    : registrationType === "organization_staff"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                    : "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200"
                }`}
              >
                <div className="flex items-center mb-4">
                  <UserIcon
                    className={`h-6 w-6 mr-2 ${
                      registrationType === "citizen"
                        ? "text-blue-600"
                        : registrationType === "organization_staff"
                        ? "text-green-600"
                        : "text-indigo-600"
                    }`}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {registrationType === "organization"
                      ? "Admin User Information"
                      : "Personal Information"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name *
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                          registrationType === "citizen"
                            ? "focus:ring-blue-500 focus:border-blue-500"
                            : registrationType === "organization_staff"
                            ? "focus:ring-green-500 focus:border-green-500"
                            : "focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                        placeholder="Enter your full name"
                        {...register("fullName", {
                          required: "Full name is required",
                        })}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Username *
                      </label>
                      <input
                        id="username"
                        type="text"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                          registrationType === "citizen"
                            ? "focus:ring-blue-500 focus:border-blue-500"
                            : registrationType === "organization_staff"
                            ? "focus:ring-green-500 focus:border-green-500"
                            : "focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                        placeholder="Choose a unique username"
                        {...register("username", {
                          required: "Username is required",
                          minLength: {
                            value: 3,
                            message: "Username must be at least 3 characters",
                          },
                        })}
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                          registrationType === "citizen"
                            ? "focus:ring-blue-500 focus:border-blue-500"
                            : registrationType === "organization_staff"
                            ? "focus:ring-green-500 focus:border-green-500"
                            : "focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                        placeholder="your.email@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                          registrationType === "citizen"
                            ? "focus:ring-blue-500 focus:border-blue-500"
                            : registrationType === "organization_staff"
                            ? "focus:ring-green-500 focus:border-green-500"
                            : "focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                        placeholder="+880-XXX-XXXXXXX"
                        {...register("phone")}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                            registrationType === "citizen"
                              ? "focus:ring-blue-500 focus:border-blue-500"
                              : registrationType === "organization_staff"
                              ? "focus:ring-green-500 focus:border-green-500"
                              : "focus:ring-indigo-500 focus:border-indigo-500"
                          }`}
                          placeholder="Create a strong password"
                          {...register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 6,
                              message: "Password must be at least 6 characters",
                            },
                          })}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm Password *
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                          registrationType === "citizen"
                            ? "focus:ring-blue-500 focus:border-blue-500"
                            : registrationType === "organization_staff"
                            ? "focus:ring-green-500 focus:border-green-500"
                            : "focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                        placeholder="Confirm your password"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                          registrationType === "citizen"
                            ? "focus:ring-blue-500 focus:border-blue-500"
                            : registrationType === "organization_staff"
                            ? "focus:ring-green-500 focus:border-green-500"
                            : "focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                        placeholder="Your address"
                        {...register("address")}
                      />
                    </div>

                    {/* Organization-specific fields */}
                    {(registrationType === "organization" ||
                      registrationType === "organization_staff") && (
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="jobTitle"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Job Title
                          </label>
                          <input
                            id="jobTitle"
                            type="text"
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                              registrationType === "organization_staff"
                                ? "focus:ring-green-500 focus:border-green-500"
                                : "focus:ring-indigo-500 focus:border-indigo-500"
                            }`}
                            placeholder="Your job title"
                            {...register("jobTitle")}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="department"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Department
                          </label>
                          <input
                            id="department"
                            type="text"
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                              registrationType === "organization_staff"
                                ? "focus:ring-green-500 focus:border-green-500"
                                : "focus:ring-indigo-500 focus:border-indigo-500"
                            }`}
                            placeholder="Your department"
                            {...register("department")}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Organization selection for staff */}
                {registrationType === "organization_staff" && (
                  <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <InformationCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <label
                        htmlFor="organizationId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Select Organization *
                      </label>
                    </div>
                    <select
                      id="organizationId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      {...register("organizationId", {
                        required:
                          registrationType === "organization_staff"
                            ? "Please select an organization"
                            : false,
                      })}
                    >
                      <option value="">
                        Choose the organization you work for
                      </option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} - {org.type.replace(/_/g, " ")} ({org.city}
                          )
                        </option>
                      ))}
                    </select>
                    {errors.organizationId && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.organizationId.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-green-700">
                      Don't see your organization? Contact your admin or ask
                      them to register the organization first.
                    </p>
                  </div>
                )}
              </div>

              {/* Volunteer Section (only for citizens) */}
              {registrationType === "citizen" && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">🤝</span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Volunteer Information
                    </h3>
                    <span className="ml-2 text-sm text-gray-500">
                      (Optional)
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="isVolunteer"
                        type="checkbox"
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        {...register("isVolunteer")}
                      />
                      <label
                        htmlFor="isVolunteer"
                        className="ml-2 block text-sm font-medium text-gray-700"
                      >
                        I want to volunteer to help resolve community issues
                      </label>
                    </div>

                    <div>
                      <label
                        htmlFor="volunteerSkills"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Skills & Expertise
                        <span className="text-xs text-gray-500 ml-1">
                          (if volunteering)
                        </span>
                      </label>
                      <textarea
                        id="volunteerSkills"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        placeholder="e.g., Plumbing, Electrical work, Community organizing, Photography, Social media management..."
                        {...register("volunteerSkills")}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Help us match you with relevant volunteer opportunities
                        in your community.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : registrationType === "citizen"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500"
                      : registrationType === "organization_staff"
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <span>
                      {registrationType === "organization"
                        ? "🏢 Register Organization"
                        : registrationType === "organization_staff"
                        ? "👥 Join as Staff Member"
                        : "👤 Create Citizen Account"}
                    </span>
                  )}
                </button>
              </div>

              {/* Terms and Privacy */}
              <div className="text-center text-xs text-gray-500">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">🏛️</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              For Government Offices
            </h3>
            <p className="text-sm text-gray-600">
              Register your office to receive and manage citizen reports
              efficiently.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">🏢</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              For NGOs & Organizations
            </h3>
            <p className="text-sm text-gray-600">
              Connect with communities and help resolve local issues.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900 mb-1">For Citizens</h3>
            <p className="text-sm text-gray-600">
              Report issues, track progress, and make your community better.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
