import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchOrganizationTypes = async () => {
    try {
      const response = await api.get('/api/organizations/types');
      setOrganizationTypes(response.data);
    } catch (error) {
      console.error('Error fetching organization types:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let result;
      
      if (registrationType === 'organization') {
        // Register organization with admin user
        result = await api.post('/api/auth/signup-organization', {
          // Organization details
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
          // Admin user details
          adminUsername: data.username,
          adminFullName: data.fullName,
          adminEmail: data.email,
          adminPassword: data.password,
          confirmPassword: data.confirmPassword,
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
          userType: registrationType === 'citizen' ? 'CITIZEN' : 
                   registrationType === 'organization_staff' ? 'ORGANIZATION_STAFF' : 'VOLUNTEER'
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
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
                    checked={registrationType === 'citizen'}
                    onChange={(e) => setRegistrationType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Citizen</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="organization_staff"
                    checked={registrationType === 'organization_staff'}
                    onChange={(e) => setRegistrationType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Organization Staff Member</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="organization"
                    checked={registrationType === 'organization'}
                    onChange={(e) => setRegistrationType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Register New Organization</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="border-b pb-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {registrationType === 'organization' ? 'Admin User Information' : 'Personal Information'}
                </h3>
              {/* Personal Information */}
              <div className="border-b pb-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {registrationType === 'organization' ? 'Admin User Information' : 'Personal Information'}
                </h3>

              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  {...register('fullName', {
                    required: 'Full name is required'
                  })}
                />
                {errors.fullName && (
                  <div className="form-error">{errors.fullName.message}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    }
                  })}
                />
                {errors.username && (
                  <div className="form-error">{errors.username.message}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
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
                {errors.email && (
                  <div className="form-error">{errors.email.message}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                {errors.password && (
                  <div className="form-error">{errors.password.message}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && (
                  <div className="form-error">{errors.confirmPassword.message}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  {...register('phone')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address (Optional)
                </label>
                <input
                  id="address"
                  type="text"
                  className="form-input"
                  {...register('address')}
                />
              </div>

              <div className="form-group">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    {...register('isVolunteer')}
                  />
                  <span className="form-label mb-0">
                    I want to volunteer to help resolve issues
                  </span>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary"
                >
                  {loading ? 'Creating account...' : 'Create account'}
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
