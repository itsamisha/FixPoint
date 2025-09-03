package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.*;
import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.service.AuthService;
import com.ambiguous.fixpoint.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    AuthService authService;

    @Autowired
    OrganizationService organizationService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        System.out.println("DEBUG: AuthController.signin called with username: " + loginRequest.getUsernameOrEmail());
        try {
            JwtAuthenticationResponse response = authService.authenticateUser(loginRequest);
            System.out.println("DEBUG: Authentication successful, returning response");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("DEBUG: Authentication failed in controller: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid username/email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            User result = authService.registerUser(signUpRequest);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully. Please check your email for verification code.");
            response.put("username", result.getUsername());
            response.put("email", result.getEmail());
            response.put("emailVerified", "false");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyOtpRequest verifyRequest) {
        try {
            boolean isVerified = authService.verifyEmail(verifyRequest.getEmail(), verifyRequest.getOtpCode());
            
            if (isVerified) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email verified successfully! Welcome to FixPoint.");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired verification code");
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest resendRequest) {
        try {
            boolean otpSent = authService.resendOtp(resendRequest.getEmail());
            
            if (otpSent) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Verification code sent to your email");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Failed to send verification code");
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/email-verification-status")
    public ResponseEntity<?> getEmailVerificationStatus(@RequestParam String email) {
        try {
            boolean isVerified = authService.isEmailVerified(email);
            Map<String, Boolean> response = new HashMap<>();
            response.put("emailVerified", isVerified);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsernameAvailability(@RequestParam String username) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", !authService.existsByUsername(username));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", !authService.existsByEmail(email));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup-organization")
    public ResponseEntity<?> registerOrganization(@Valid @RequestBody OrganizationRegistrationRequest request) {
        try {
            // Create organization
            Organization organization = new Organization();
            organization.setName(request.getName());
            organization.setDescription(request.getDescription());
            organization.setType(request.getType());
            organization.setAddress(request.getAddress());
            organization.setCity(request.getCity());
            organization.setState(request.getState());
            organization.setZipCode(request.getZipCode());
            organization.setCountry(request.getCountry());
            organization.setContactPhone(request.getContactPhone());
            organization.setContactEmail(request.getContactEmail());
            organization.setWebsite(request.getWebsite());
            organization.setLatitude(request.getLatitude());
            organization.setLongitude(request.getLongitude());
            organization.setServiceAreas(request.getServiceAreas());
            organization.setCategories(request.getCategories());

            Organization savedOrganization = organizationService.createOrganization(organization);

            // Create admin user for the organization
            SignUpRequest adminSignUp = new SignUpRequest();
            adminSignUp.setUsername(request.getAdminUsername());
            adminSignUp.setFullName(request.getAdminFullName());
            adminSignUp.setEmail(request.getAdminEmail());
            adminSignUp.setPassword(request.getAdminPassword());
            adminSignUp.setConfirmPassword(request.getConfirmPassword());
            adminSignUp.setPhone(request.getAdminPhone());
            adminSignUp.setJobTitle(request.getAdminJobTitle());
            adminSignUp.setDepartment(request.getAdminDepartment());
            adminSignUp.setUserType(User.UserType.ORGANIZATION_ADMIN);
            adminSignUp.setOrganizationId(savedOrganization.getId());

            User adminUser = authService.registerUser(adminSignUp);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Organization and admin user registered successfully");
            response.put("organizationId", savedOrganization.getId());
            response.put("adminUserId", adminUser.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
