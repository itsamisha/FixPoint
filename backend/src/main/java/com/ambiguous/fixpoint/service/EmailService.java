package com.ambiguous.fixpoint.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@fixpoint.com}")
    private String fromEmail;

    @Value("${app.name:FixPoint}")
    private String appName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify Your Email - " + appName);
            
            String emailBody = buildOtpEmailBody(otpCode, userName);
            message.setText(emailBody);
            
            mailSender.send(message);
            logger.info("OTP email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to " + appName + "!");
            
            String emailBody = buildWelcomeEmailBody(userName);
            message.setText(emailBody);
            
            mailSender.send(message);
            logger.info("Welcome email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", toEmail, e);
            // Don't throw exception for welcome email failure
        }
    }

    private String buildOtpEmailBody(String otpCode, String userName) {
        return String.format("""
            Hi %s,
            
            Welcome to %s! Please verify your email address to complete your registration.
            
            Your verification code is: %s
            
            This code will expire in 10 minutes for security reasons.
            
            If you didn't request this verification, please ignore this email.
            
            Best regards,
            The %s Team
            
            ---
            This is an automated email. Please do not reply.
            """, 
            userName, appName, otpCode, appName);
    }

    private String buildWelcomeEmailBody(String userName) {
        return String.format("""
            Hi %s,
            
            Welcome to %s! Your email has been successfully verified.
            
            You can now:
            • Report civic issues in your community
            • Track the status of your reports
            • Engage with local organizations
            • Vote and comment on reports
            
            Get started by logging into your account and exploring the platform.
            
            Thank you for joining our community!
            
            Best regards,
            The %s Team
            """, 
            userName, appName, appName);
    }
}
