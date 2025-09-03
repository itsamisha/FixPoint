package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.service.EmailService;
import com.ambiguous.fixpoint.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class EmailTestController {

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private OtpService otpService;

    @PostMapping("/email")
    public ResponseEntity<?> testEmail(@RequestParam String email) {
        try {
            emailService.sendOtpEmail(email, "123456", "Test User");
            return ResponseEntity.ok("Email sent successfully to " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to send email: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/clear-otp")
    public ResponseEntity<?> clearOtp(@RequestParam String email) {
        try {
            otpService.clearOtpsForEmail(email);
            return ResponseEntity.ok("OTP attempts cleared for " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("Failed to clear OTP: " + e.getMessage());
        }
    }
}
