package com.ambiguous.fixpoint.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_otps")
public class EmailVerificationOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Email
    @Column(nullable = false)
    private String email;

    @NotBlank
    @Size(min = 6, max = 6)
    @Column(nullable = false)
    private String otpCode;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean isUsed = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OtpType otpType = OtpType.EMAIL_VERIFICATION;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructors
    public EmailVerificationOtp() {}

    public EmailVerificationOtp(String email, String otpCode, LocalDateTime expiresAt) {
        this.email = email;
        this.otpCode = otpCode;
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Boolean getIsUsed() { return isUsed; }
    public void setIsUsed(Boolean isUsed) { this.isUsed = isUsed; }

    public OtpType getOtpType() { return otpType; }
    public void setOtpType(OtpType otpType) { this.otpType = otpType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Utility methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isValid() {
        return !this.isUsed && !this.isExpired();
    }

    // Enum for OTP types
    public enum OtpType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET,
        EMAIL_CHANGE
    }
}
