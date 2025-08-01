package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.dto.*;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.security.JwtTokenProvider;
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(loginRequest.getUsernameOrEmail())
                .orElseGet(() -> userRepository.findByEmail(loginRequest.getUsernameOrEmail()).orElse(null));
        
        UserSummary userSummary = convertToUserSummary(user);
        
        return new JwtAuthenticationResponse(jwt, userSummary);
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

        return userRepository.save(user);
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
