import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Register.css'; // Import the CSS file

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState('citizen');
  const [organizations, setOrganizations] = useState([]);
  const [organizationTypes, setOrganizationTypes] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (registrationType === 'organization_staff') {
      fetchOrganizations();
    }
    if (registrationType === 'organization') {
      fetchOrganizationTypes();
    }
  }, [registrationType]);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/api/organizations');
      // Ensure we always set an array
      if (response.data && Array.isArray(response.data)) {
        setOrganizations(response.data);
      } else {
        console.warn('Organizations response is not an array:', response.data);
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]); // Set empty array on error
    }
  };

  const fetchOrganizationTypes = async () => {
    try {
      const response = await api.get('/api/organizations/types');
      // Ensure we always set an array
      if (response.data && Array.isArray(response.data)) {
        setOrganizationTypes(response.data);
      } else {
        console.warn('Organization types response is not an array:', response.data);
        setOrganizationTypes([]);
      }
    } catch (error) {
      console.error('Error fetching organization types:', error);
      setOrganizationTypes([]); // Set empty array on error
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let result;

      if (registrationType === 'organization') {
        // Register organization with admin user
        result = await api.post('/api/auth/signup-organization', {
          name: data.organizationName,
          description: data.organizationDescription,
          type: data.organizationType,
          address: data.organizationAddress,
          city: data.organizationCity,
          state: data.organizationState,
          zipCode: data.organizationZipCode,
          country: data.organizationCountry || 'Bangladesh',
          contactPhone: data.organizationPhone,
          contactEmail: data.organizationEmail,
          website: data.organizationWebsite,
          serviceAreas: data.serviceAreas,
          categories: data.categories,
          adminUsername: data.username,
          adminFullName: data.fullName,
          adminEmail: data.email,
          adminPassword: data.password,
          adminPhone: data.phone,
          adminJobTitle: data.jobTitle,
          adminDepartment: data.department
        });

        if (result.status === 200) {
          toast.success('Organization registered successfully! Please log in.');
          navigate('/login');
        }
      } else {
        // Regular user registration
        const userData = {
          ...data,
          userType:
            registrationType === 'citizen'
              ? 'CITIZEN'
              : registrationType === 'organization_staff'
              ? 'ORGANIZATION_STAFF'
              : 'VOLUNTEER'
        };

        result = await registerUser(userData);
        if (result.success) {
          toast.success('Registration successful! Please log in.');
          navigate('/login');
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <h2>Create Your Account</h2>
          <p>
            Or{' '}
            <Link to="/login">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Registration Type */}
<div className="register-section">
  <label className="block text-gray-700 font-medium mb-2">Registration Type</label>
  <div className="radio-group">
    {['citizen', 'organization_staff', 'organization'].map((type) => (
      <label key={type} className={`radio-label ${registrationType === type ? 'selected' : ''}`}>
        <input
          type="radio"
          value={type}
          checked={registrationType === type}
          onChange={(e) => setRegistrationType(e.target.value)}
        />
        <span></span>
        {type === 'citizen'
          ? 'Citizen'
          : type === 'organization_staff'
          ? 'Organization Staff Member'
          : 'Register New Organization'}
      </label>
    ))}
  </div>
</div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Organization Information */}
          {registrationType === 'organization' && (
            <div className="register-section">
              <h3>Organization Information</h3>
              <div className="grid-2">
                <div>
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('organizationName', { required: 'Organization name is required' })}
                  />
                  {errors.organizationName && <p className="form-error">{errors.organizationName.message}</p>}
                </div>

                <div>
                  <label>Organization Type *</label>
                  <select
                    className="form-input"
                    {...register('organizationType', { required: 'Organization type is required' })}
                  >
                    <option value="">Select Type</option>
                    {Array.isArray(organizationTypes) && organizationTypes.length > 0 ? organizationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    )) : (
                      <option value="" disabled>No organization types available</option>
                    )}
                  </select>
                  {errors.organizationType && <p className="form-error">{errors.organizationType.message}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label>Description</label>
                <textarea className="form-input" {...register('organizationDescription')} rows={3} />
              </div>

              <div className="grid-2 mt-4">
                <div>
                  <label>Contact Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    {...register('organizationPhone', { required: 'Organization phone is required' })}
                  />
                  {errors.organizationPhone && <p className="form-error">{errors.organizationPhone.message}</p>}
                </div>

                <div>
                  <label>Contact Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    {...register('organizationEmail', { required: 'Organization email is required' })}
                  />
                  {errors.organizationEmail && <p className="form-error">{errors.organizationEmail.message}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label>Website</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com"
                  {...register('organizationWebsite')}
                />
              </div>

              <div className="mt-4">
                <label>Address *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('organizationAddress', { required: 'Organization address is required' })}
                />
                {errors.organizationAddress && <p className="form-error">{errors.organizationAddress.message}</p>}
              </div>

              <div className="grid-2 mt-4">
                <div>
                  <label>City *</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('organizationCity', { required: 'City is required' })}
                  />
                  {errors.organizationCity && <p className="form-error">{errors.organizationCity.message}</p>}
                </div>

                <div>
                  <label>State/Division *</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('organizationState', { required: 'State/Division is required' })}
                  />
                  {errors.organizationState && <p className="form-error">{errors.organizationState.message}</p>}
                </div>
              </div>

              <div className="grid-2 mt-4">
                <div>
                  <label>ZIP/Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('organizationZipCode')}
                  />
                </div>

                <div>
                  <label>Country</label>
                  <input
                    type="text"
                    className="form-input"
                    defaultValue="Bangladesh"
                    {...register('organizationCountry')}
                  />
                </div>
              </div>

              <div className="grid-2 mt-4">
                <div>
                  <label>Service Areas</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="e.g., Dhaka, Chittagong, Sylhet"
                    {...register('serviceAreas')}
                  />
                </div>

                <div>
                  <label>Service Categories</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="e.g., Infrastructure, Healthcare, Environment"
                    {...register('categories')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="register-section">
            <h3>{registrationType === 'organization' ? 'Admin User Information' : 'Personal Information'}</h3>

            <div className="grid-2">
              <div>
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('fullName', { required: 'Full name is required' })}
                />
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>

              <div>
                <label>Username *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' }
                  })}
                />
                {errors.username && <p className="form-error">{errors.username.message}</p>}
              </div>
            </div>

            <div className="grid-2 mt-4">
              <div>
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div>
                <label>Password *</label>
                <input
                  type="password"
                  className="form-input"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>
            </div>

            <div className="grid-2 mt-4">
              <div>
                <label>Confirm Password *</label>
                <input
                  type="password"
                  className="form-input"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
              </div>

              <div>
                <label>Phone Number</label>
                <input type="tel" className="form-input" {...register('phone')} />
              </div>
            </div>

            <div className="mt-4">
              <label>Address</label>
              <input type="text" className="form-input" {...register('address')} />
            </div>

            {/* Organization Admin Specific Fields */}
            {registrationType === 'organization' && (
              <div className="grid-2 mt-4">
                <div>
                  <label>Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Director, Manager, Administrator"
                    {...register('jobTitle')}
                  />
                </div>

                <div>
                  <label>Department</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Administration, Operations"
                    {...register('department')}
                  />
                </div>
              </div>
            )}

            {/* Organization Staff Specific Fields */}
            {registrationType === 'organization_staff' && (
              <div className="organization-staff-section">
                <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>Organization Information</h3>
                <div>
                  <label>Select Organization *</label>
                  <select
                    className="form-input"
                    {...register('organizationId', {
                      required: 'Please select an organization'
                    })}
                  >
                    <option value="">Choose your organization</option>
                    {Array.isArray(organizations) && organizations.length > 0 ? organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} - {org.type?.replace(/_/g, ' ')} ({org.city})
                      </option>
                    )) : (
                      <option value="" disabled>No organizations available</option>
                    )}
                  </select>
                  {errors.organizationId && <p className="form-error">{errors.organizationId.message}</p>}
                </div>

                <div className="grid-2 mt-4">
                  <div>
                    <label>Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Engineer, Manager, Officer"
                      {...register('jobTitle')}
                    />
                  </div>

                  <div>
                    <label>Department</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Engineering, Administration"
                      {...register('department')}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label>Employee ID (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your organization employee ID"
                    {...register('employeeId')}
                  />
                </div>
              </div>
            )}

            {/* Volunteer Section (only for citizens) */}
            {registrationType === 'citizen' && (
              <div className="volunteer-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('isVolunteer')}
                  />
                  <span></span>
                  I want to volunteer to help resolve community issues
                </label>
                
                <div className="mt-3">
                  <label>Skills & Expertise (if volunteering)</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="e.g., Plumbing, Electrical work, Community organizing..."
                    {...register('volunteerSkills')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? 'Creating account...'
                : registrationType === 'organization'
                ? 'Register Organization'
                : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
