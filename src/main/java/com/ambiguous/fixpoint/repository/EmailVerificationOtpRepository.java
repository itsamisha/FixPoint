package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.EmailVerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, Long> {
    
    /**
     * Find the most recent valid OTP for an email
     */
    Optional<EmailVerificationOtp> findTopByEmailAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String email, LocalDateTime currentTime);
    
    /**
     * Find OTP by email and code
     */
    Optional<EmailVerificationOtp> findByEmailAndOtpCodeAndIsUsedFalse(String email, String otpCode);
    
    /**
     * Mark all previous OTPs for an email as used
     */
    @Modifying
    @Transactional
    @Query("UPDATE EmailVerificationOtp o SET o.isUsed = true WHERE o.email = :email AND o.isUsed = false")
    void markAllOtpsAsUsedForEmail(@Param("email") String email);
    
    /**
     * Delete expired OTPs (cleanup task)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerificationOtp o WHERE o.expiresAt < :currentTime")
    void deleteExpiredOtps(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Count active OTPs for an email (to prevent spam)
     */
    long countByEmailAndIsUsedFalseAndExpiresAtAfter(String email, LocalDateTime currentTime);
    
    /**
     * Delete all OTPs for a specific email (for testing/debugging)
     */
    @Modifying
    @Transactional
    void deleteByEmail(String email);
    
    /**
     * Delete expired OTPs by expiry time (alternative method)
     */
    @Modifying
    @Transactional
    void deleteByExpiresAtBefore(LocalDateTime currentTime);
}
