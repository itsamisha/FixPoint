package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.ReportSummary;
import com.ambiguous.fixpoint.dto.LoginRequest;
import com.ambiguous.fixpoint.dto.JwtAuthenticationResponse;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.service.ReportService;
import com.ambiguous.fixpoint.service.AuthService;
import com.ambiguous.fixpoint.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Autowired
    private ChatbotService chatbotService;

    @GetMapping("/reports")
    public ResponseEntity<Page<ReportSummary>> getPublicReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ReportSummary> reports;
        if (status != null) {
            reports = reportService.getReportsByStatus(Report.Status.valueOf(status.toUpperCase()), pageable, null);
        } else if (category != null) {
            reports = reportService.getReportsByCategory(Report.Category.valueOf(category.toUpperCase()), pageable, null);
        } else {
            reports = reportService.getAllReports(pageable, null);
        }

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/resolved")
    public ResponseEntity<Page<ReportSummary>> getResolvedReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("resolvedAt").descending());
        Page<ReportSummary> reports = reportService.getReportsByStatus(Report.Status.RESOLVED, pageable, null);

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/area")
    public ResponseEntity<List<ReportSummary>> getPublicReportsInArea(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng) {

        List<ReportSummary> reports = reportService.getReportsInArea(minLat, maxLat, minLng, maxLng, null);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/reports/categories")
    public ResponseEntity<Report.Category[]> getReportCategories() {
        return ResponseEntity.ok(Report.Category.values());
    }

    @GetMapping("/reports/statuses")
    public ResponseEntity<Report.Status[]> getReportStatuses() {
        return ResponseEntity.ok(Report.Status.values());
    }

    @GetMapping("/reports/priorities")
    public ResponseEntity<Report.Priority[]> getReportPriorities() {
        return ResponseEntity.ok(Report.Priority.values());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("userCount", userRepository.count());
        
        // Check if test user exists
        boolean testUserExists = userRepository.findByUsername("test").isPresent();
        health.put("testUserExists", testUserExists);
        
        // Get test user details for debugging
        if (testUserExists) {
            User testUser = userRepository.findByUsername("test").get();
            health.put("testUserEmail", testUser.getEmail());
            health.put("testUserActive", testUser.getIsActive());
            health.put("testUserEmailVerified", testUser.getEmailVerified());
            health.put("testUserRole", testUser.getRole());
            health.put("passwordHash", testUser.getPassword().substring(0, 10) + "...");
            
            // Test password matching
            boolean passwordMatches = passwordEncoder.matches("password", testUser.getPassword());
            health.put("passwordMatches", passwordMatches);
        }
        
        return ResponseEntity.ok(health);
    }

    @PostMapping("/debug-auth")
    public ResponseEntity<Map<String, Object>> debugAuth(@RequestBody Map<String, String> request) {
        Map<String, Object> result = new HashMap<>();
        String usernameOrEmail = request.get("usernameOrEmail");
        String password = request.get("password");
        
        try {
            // Check if user exists
            User user = userRepository.findByUsername(usernameOrEmail)
                    .orElse(userRepository.findByEmail(usernameOrEmail).orElse(null));
            
            if (user == null) {
                result.put("error", "User not found");
                return ResponseEntity.ok(result);
            }
            
            // Check password
            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
            result.put("userFound", true);
            result.put("passwordMatches", passwordMatches);
            result.put("userActive", user.getIsActive());
            result.put("userRole", user.getRole());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", e.getMessage());
            return ResponseEntity.ok(result);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> testSignin(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("DEBUG: Public signin called with: " + loginRequest.getUsernameOrEmail());
            JwtAuthenticationResponse response = authService.authenticateUser(loginRequest);
            System.out.println("DEBUG: Authentication successful, returning response");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("DEBUG: Authentication failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Authentication failed: " + e.getMessage());
            error.put("type", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Chatbot endpoints
    @PostMapping("/chatbot/chat")
    public ResponseEntity<?> chatWithBot(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            String context = request.get("context");
            String sessionId = request.get("sessionId");
            
            if (message == null || message.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Message cannot be empty");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Generate unique session ID if not provided
            if (sessionId == null || sessionId.trim().isEmpty()) {
                sessionId = "session_" + UUID.randomUUID().toString();
            }
            
            String response = chatbotService.generateResponse(message, context, sessionId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("response", response);
            result.put("sessionId", sessionId);
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Chatbot error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Sorry, I'm having trouble right now. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/chatbot/history/{sessionId}")
    public ResponseEntity<?> getChatHistory(@PathVariable String sessionId) {
        try {
            List<Map<String, Object>> conversations = chatbotService.getConversationHistory(sessionId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("conversations", conversations);
            result.put("sessionId", sessionId);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error fetching chat history: " + e.getMessage());
            
            Map<String, Object> result = new HashMap<>();
            result.put("conversations", new java.util.ArrayList<>());
            result.put("sessionId", sessionId);
            
            return ResponseEntity.ok(result);
        }
    }

    @GetMapping("/chatbot/status")
    public ResponseEntity<?> getChatbotStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("available", true);
            status.put("aiEnabled", true);
            status.put("version", "1.0");
            status.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            Map<String, Object> status = new HashMap<>();
            status.put("available", false);
            status.put("error", e.getMessage());
            
            return ResponseEntity.ok(status);
        }
    }
}
