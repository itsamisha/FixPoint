import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Shield, RotateCcw, CheckCircle } from "lucide-react";
import { authService } from "../../services/authService";
import "./EmailVerification.css";

const EmailVerification = () => {
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or redirect to register
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      toast.error("Please register first");
      navigate("/register");
    }
  }, [location, navigate]);

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const otpString = otpCode.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyEmail(email, otpString);
      toast.success("Email verified successfully! Welcome to FixPoint.");
      navigate("/login", {
        state: {
          message: "Email verified! You can now log in.",
          email: email,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid verification code");
      // Clear OTP inputs on error
      setOtpCode(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    try {
      await authService.resendOtp(email);
      toast.success("Verification code sent to your email");
      setResendCooldown(60); // 60 seconds cooldown
      // Clear current OTP
      setOtpCode(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="verification-header">
          <div className="verification-icon">
            <Mail size={32} />
          </div>
          <h1>Verify Your Email</h1>
          <p>We've sent a 6-digit verification code to</p>
          <span className="email-display">{email}</span>
        </div>

        <form onSubmit={handleVerifyOtp} className="verification-form">
          <div className="otp-input-container">
            <label className="otp-label">
              <Shield size={16} />
              Enter Verification Code
            </label>
            <div className="otp-inputs">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                  placeholder="0"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.join("").length !== 6}
            className="verify-button"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Verify Email
              </>
            )}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading || resendCooldown > 0}
            className="resend-button"
          >
            <RotateCcw size={16} />
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : resendLoading
              ? "Sending..."
              : "Resend Code"}
          </button>
        </div>

        <div className="verification-tips">
          <h3>Tips:</h3>
          <ul>
            <li>Check your spam/junk folder if you don't see the email</li>
            <li>The verification code expires in 10 minutes</li>
            <li>You can request a new code if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
