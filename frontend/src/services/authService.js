import api from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/auth/signin', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Verify email with OTP
  verifyEmail: async (email, otpCode) => {
    const response = await api.post('/api/auth/verify-email', {
      email,
      otpCode
    });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post('/api/auth/resend-otp', {
      email
    });
    return response.data;
  },

  // Check email verification status
  checkEmailVerificationStatus: async (email) => {
    const response = await api.get(`/api/auth/email-verification-status?email=${email}`);
    return response.data;
  },

  // Check username availability
  checkUsernameAvailability: async (username) => {
    const response = await api.get(`/api/auth/check-username?username=${username}`);
    return response.data;
  },

  // Check email availability
  checkEmailAvailability: async (email) => {
    const response = await api.get(`/api/auth/check-email?email=${email}`);
    return response.data;
  },

  // Register organization
  registerOrganization: async (orgData) => {
    const response = await api.post('/api/auth/signup-organization', orgData);
    return response.data;
  }
};

export { authService };
export default authService;
