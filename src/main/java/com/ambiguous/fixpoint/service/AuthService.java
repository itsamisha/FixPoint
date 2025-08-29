package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.dto.*;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.UserRepository;
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

    public JwtAuthenticationResponse authenticateUser(LoginRequest loginRequest) {
        System.out.println("DEBUG: Attempting authentication for: " + loginRequest.getUsernameOrEmail());
        
        try {
            // Manual authentication for debugging
            User user = userRepository.findByUsername(loginRequest.getUsernameOrEmail())
                    .orElse(userRepository.findByEmail(loginRequest.getUsernameOrEmail()).orElse(null));
            
            if (user == null) {
                System.out.println("DEBUG: User not found");
                throw new RuntimeException("User not found");
            }
            
            System.out.println("DEBUG: User found: " + user.getUsername());
            
            // Check password manually
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                System.out.println("DEBUG: Password does not match");
                throw new RuntimeException("Invalid password");
            }
            
            System.out.println("DEBUG: Password matches, creating authentication");
            
            // Create authentication manually
            UserPrincipal userPrincipal = UserPrincipal.create(user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userPrincipal, null, userPrincipal.getAuthorities());
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            System.out.println("DEBUG: JWT token generated");
            
            System.out.println("DEBUG: User found: " + user.getUsername());
            UserSummary userSummary = convertToUserSummary(user);

            System.out.println("DEBUG: Returning authentication response");
            return new JwtAuthenticationResponse(jwt, userSummary);
        } catch (Exception e) {
            System.out.println("DEBUG: Authentication failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public User registerUser(SignUpRequest signUpRequest) {
        if(userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if(userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Email Address already in use!");
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
        
        User savedUser = userRepository.save(user);
        
        // Set organization relationship if organizationId is provided
        if (signUpRequest.getOrganizationId() != null) {
            // We'll need to inject OrganizationService here or handle this differently
            // For now, we'll save the user first and then update the organization relationship
        }

        return savedUser;
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
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
        userSummary.setIsVolunteer(user.getIsVolunteer());
        userSummary.setVolunteerSkills(user.getVolunteerSkills());
        userSummary.setEmailVerified(user.getEmailVerified());
        userSummary.setIsActive(user.getIsActive());
        userSummary.setCreatedAt(user.getCreatedAt());
        return userSummary;
    }
}
