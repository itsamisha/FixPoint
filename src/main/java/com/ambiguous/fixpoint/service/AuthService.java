package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.dto.*;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.repository.OrganizationRepository;
import com.ambiguous.fixpoint.security.JwtTokenProvider;
import com.ambiguous.fixpoint.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtTokenProvider tokenProvider;

    @Autowired
    OrganizationRepository organizationRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    public JwtAuthenticationResponse authenticateUser(LoginRequest loginRequest) {
        System.out.println("DEBUG: Attempting authentication for: " + loginRequest.getUsernameOrEmail());
        
        try {
            // Use Spring Security's authentication manager for proper authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            System.out.println("DEBUG: JWT token generated successfully");
            
            // Get the authenticated user
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));
            
            UserSummary userSummary = convertToUserSummary(user);

            System.out.println("DEBUG: Authentication successful for user: " + user.getUsername());
            return new JwtAuthenticationResponse(jwt, userSummary);
        } catch (Exception e) {
            System.out.println("DEBUG: Authentication failed: " + e.getMessage());
            throw new RuntimeException("Invalid username/email or password");
        }
    }

    public User registerUser(SignUpRequest signUpRequest) {
        if(userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if(userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Email Address already in use!");
        }

        // Validate password confirmation
        if (!signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            throw new RuntimeException("Password and confirm password do not match!");
        }

        // Creating user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                passwordEncoder.encode(signUpRequest.getPassword()),
                signUpRequest.getFullName());

        user.setPhone(signUpRequest.getPhone());
        user.setAddress(signUpRequest.getAddress());
        user.setLatitude(signUpRequest.getLatitude());
        user.setLongitude(signUpRequest.getLongitude());
        user.setIsVolunteer(signUpRequest.getIsVolunteer());
        user.setVolunteerSkills(signUpRequest.getVolunteerSkills());
        
        // Set user type and organization if provided
        if (signUpRequest.getUserType() != null) {
            user.setUserType(signUpRequest.getUserType());
        }
        
        if (signUpRequest.getJobTitle() != null) {
            user.setJobTitle(signUpRequest.getJobTitle());
        }
        
        if (signUpRequest.getDepartment() != null) {
            user.setDepartment(signUpRequest.getDepartment());
        }
        
        if (signUpRequest.getEmployeeId() != null) {
            user.setEmployeeId(signUpRequest.getEmployeeId());
        }
        
        // Set role based on user type
        if (signUpRequest.getUserType() == User.UserType.ORGANIZATION_ADMIN) {
            user.setRole(User.Role.ORG_ADMIN);
        } else if (signUpRequest.getUserType() == User.UserType.ORGANIZATION_STAFF) {
            user.setRole(User.Role.ORG_STAFF);
        }
        
        // Link organization if provided (for organization staff/admin registrations)
        if (signUpRequest.getOrganizationId() != null) {
            Organization organization = organizationRepository.findById(signUpRequest.getOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Organization not found"));
            user.setOrganization(organization);
        }

        // Set email as unverified initially
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        
        // Generate and send OTP for email verification
        try {
            otpService.generateAndSendOtp(savedUser.getEmail(), savedUser.getFullName());
        } catch (Exception e) {
            // If OTP sending fails, delete the user and throw exception
            userRepository.delete(savedUser);
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }
        
        return savedUser;
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Verify email with OTP
     */
    public boolean verifyEmail(String email, String otpCode) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify OTP
        boolean isOtpValid = otpService.verifyOtp(email, otpCode);
        
        if (isOtpValid) {
            // Mark email as verified
            user.setEmailVerified(true);
            userRepository.save(user);
            
            // Send welcome email
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
            
            return true;
        }
        
        return false;
    }

    /**
     * Resend OTP for email verification
     */
    public boolean resendOtp(String email) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is already verified
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Generate and send new OTP
        return otpService.generateAndSendOtp(email, user.getFullName());
    }

    /**
     * Check if user's email is verified
     */
    public boolean isEmailVerified(String email) {
        return userRepository.findByEmail(email)
                .map(User::getEmailVerified)
                .orElse(false);
    }

    private UserSummary convertToUserSummary(User user) {
        UserSummary userSummary = new UserSummary();
        userSummary.setId(user.getId());
        userSummary.setUsername(user.getUsername());
        userSummary.setEmail(user.getEmail());
        userSummary.setFullName(user.getFullName());
        userSummary.setPhone(user.getPhone());
        userSummary.setAddress(user.getAddress());
        userSummary.setLatitude(user.getLatitude());
        userSummary.setLongitude(user.getLongitude());
        userSummary.setRole(user.getRole());
        userSummary.setUserType(user.getUserType());
        userSummary.setOrganizationId(user.getOrganization() != null ? user.getOrganization().getId() : null);
        userSummary.setIsVolunteer(user.getIsVolunteer());
        userSummary.setVolunteerSkills(user.getVolunteerSkills());
        userSummary.setEmailVerified(user.getEmailVerified());
        userSummary.setIsActive(user.getIsActive());
        userSummary.setCreatedAt(user.getCreatedAt());
        return userSummary;
    }
}
