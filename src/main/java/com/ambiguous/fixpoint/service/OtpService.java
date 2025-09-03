package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.entity.EmailVerificationOtp;
import com.ambiguous.fixpoint.repository.EmailVerificationOtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_OTP_ATTEMPTS_PER_EMAIL = 3;
    
    private final EmailVerificationOtpRepository otpRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    public OtpService(EmailVerificationOtpRepository otpRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    /**
     * Generate and send OTP to email
     */
    public boolean generateAndSendOtp(String email, String userName) {
        try {
            // Check if user has too many active OTPs (spam prevention)
            long activeOtpCount = otpRepository.countByEmailAndIsUsedFalseAndExpiresAtAfter(
                    email, LocalDateTime.now());
                    
            if (activeOtpCount >= MAX_OTP_ATTEMPTS_PER_EMAIL) {
                logger.warn("Too many OTP attempts for email: {}", email);
                throw new RuntimeException("Too many OTP requests. Please wait before requesting a new code.");
            }

            // Generate 6-digit OTP
            String otpCode = generateSixDigitOtp();
            
            // Set expiry time
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
            
            // Try to send email, but use fallback if it fails
            boolean emailSent = false;
            try {
                emailService.sendOtpEmail(email, otpCode, userName);
                emailSent = true;
                logger.info("OTP email sent successfully to: {}", email);
            } catch (Exception emailError) {
                logger.warn("Email sending failed, using development fallback. OTP Code: {} for email: {}", otpCode, email);
                logger.warn("Email error: {}", emailError.getMessage());
                
                // In development mode, log the OTP code to console
                System.out.println("=".repeat(60));
                System.out.println("📧 EMAIL SENDING FAILED - DEVELOPMENT FALLBACK");
                System.out.println("Email: " + email);
                System.out.println("OTP Code: " + otpCode);
                System.out.println("User: " + userName);
                System.out.println("Expires: " + expiresAt);
                System.out.println("=".repeat(60));
            }
            
            // Save OTP to database regardless of email success (for development)
            EmailVerificationOtp otp = new EmailVerificationOtp(email, otpCode, expiresAt);
            otpRepository.save(otp);
            
            if (emailSent) {
                logger.info("OTP generated and sent via email for: {}", email);
            } else {
                logger.info("OTP generated and logged to console for development: {}", email);
            }
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to generate OTP for email: {}", email, e);
            throw new RuntimeException("Failed to generate verification code: " + e.getMessage());
        }
    }

    /**
     * Verify OTP code
     */
    public boolean verifyOtp(String email, String otpCode) {
        try {
            Optional<EmailVerificationOtp> otpOptional = otpRepository
                    .findByEmailAndOtpCodeAndIsUsedFalse(email, otpCode);
            
            if (otpOptional.isEmpty()) {
                logger.warn("Invalid OTP code for email: {}", email);
                return false;
            }
            
            EmailVerificationOtp otp = otpOptional.get();
            
            // Check if OTP is expired
            if (otp.isExpired()) {
                logger.warn("Expired OTP code for email: {}", email);
                return false;
            }
            
            // Mark OTP as used
            otp.setIsUsed(true);
            otpRepository.save(otp);
            
            // Mark all other OTPs for this email as used
            otpRepository.markAllOtpsAsUsedForEmail(email);
            
            logger.info("OTP verified successfully for email: {}", email);
            return true;
            
        } catch (Exception e) {
            logger.error("Error verifying OTP for email: {}", email, e);
            return false;
        }
    }

    /**
     * Check if there's a valid OTP for email
     */
    public boolean hasValidOtp(String email) {
        Optional<EmailVerificationOtp> otp = otpRepository
                .findTopByEmailAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        email, LocalDateTime.now());
        return otp.isPresent();
    }

    /**
     * Clean up expired OTPs (can be called by scheduled task)
     */
    public void cleanupExpiredOtps() {
        try {
            otpRepository.deleteExpiredOtps(LocalDateTime.now());
            logger.info("Expired OTPs cleaned up successfully");
        } catch (Exception e) {
            logger.error("Error cleaning up expired OTPs", e);
        }
    }

    /**
     * Clear all OTPs for a specific email (for testing/debugging)
     */
    public void clearOtpsForEmail(String email) {
        try {
            otpRepository.deleteByEmail(email);
            logger.info("All OTPs cleared for email: {}", email);
        } catch (Exception e) {
            logger.error("Error clearing OTPs for email: {}", email, e);
        }
    }

    /**
     * Generate secure 6-digit OTP
     */
    private String generateSixDigitOtp() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }
}
