package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.JwtAuthenticationResponse;
import com.ambiguous.fixpoint.dto.LoginRequest;
import com.ambiguous.fixpoint.dto.SignUpRequest;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.service.AuthService;
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
            response.put("message", "User registered successfully");
            response.put("username", result.getUsername());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
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
}
