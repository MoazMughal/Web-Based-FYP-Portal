import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import logo from "../../logo.jpg";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [userType, setUserType] = useState("student");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/auth/forgot-password/${userType}`,
        { email }
      );

      if (response.data.success) {
        toast.success("OTP sent to your email!");
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/verify-otp",
        { email, otp }
      );

      if (response.data.success) {
        toast.success("OTP verified successfully!");
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast.error("Password is required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/auth/reset-password/${userType}`,
        { email, newPassword }
      );

      if (response.data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate(userType === "student" ? "/" : `/${userType}login`);
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
      <ToastContainer />
      
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-6 col-xl-5">
            <div className="text-center mb-4">
              <img src={logo} alt="QAU Logo" className="rounded-circle shadow mb-3" style={{width: '80px', height: '80px'}} />
              <h2 className="fw-bold text-primary">Reset Password</h2>
              <p className="text-muted">FYP Portal - Password Recovery</p>
            </div>

            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-header bg-gradient-primary text-white text-center py-4 rounded-top-4">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-key me-2"></i>
                  {step === 1 && "Request OTP"}
                  {step === 2 && "Verify OTP"}
                  {step === 3 && "Set New Password"}
                </h5>
              </div>

              <div className="card-body p-4">
                {/* User Type Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Select User Type</label>
                  <div className="btn-group w-100" role="group">
                    <input type="radio" className="btn-check" name="userType" id="student" value="student" 
                           checked={userType === "student"} onChange={(e) => setUserType(e.target.value)} />
                    <label className="btn btn-outline-primary" htmlFor="student">
                      <i className="fas fa-user-graduate me-1"></i> Student
                    </label>

                    <input type="radio" className="btn-check" name="userType" id="teacher" value="teacher"
                           checked={userType === "teacher"} onChange={(e) => setUserType(e.target.value)} />
                    <label className="btn btn-outline-success" htmlFor="teacher">
                      <i className="fas fa-chalkboard-teacher me-1"></i> Teacher
                    </label>

                    <input type="radio" className="btn-check" name="userType" id="coordinator" value="coordinator"
                           checked={userType === "coordinator"} onChange={(e) => setUserType(e.target.value)} />
                    <label className="btn btn-outline-info" htmlFor="coordinator">
                      <i className="fas fa-user-tie me-1"></i> Coordinator
                    </label>
                  </div>
                </div>

                {/* Step 1: Request OTP */}
                {step === 1 && (
                  <form onSubmit={handleRequestOTP}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Email Address</label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold" disabled={isLoading}>
                      {isLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Sending OTP...</>
                      ) : (
                        <><i className="fas fa-paper-plane me-2"></i>Send OTP</>
                      )}
                    </button>
                  </form>
                )}

                {/* Step 2: Verify OTP */}
                {step === 2 && (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      OTP has been sent to <strong>{email}</strong>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Enter OTP</label>
                      <input
                        type="text"
                        className="form-control form-control-lg text-center"
                        placeholder="000000"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={isLoading}
                        style={{letterSpacing: '10px', fontSize: '24px'}}
                      />
                      <small className="text-muted">Valid for 10 minutes</small>
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-3 fw-bold" disabled={isLoading}>
                      {isLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</>
                      ) : (
                        <><i className="fas fa-check me-2"></i>Verify OTP</>
                      )}
                    </button>

                    <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setStep(1)}>
                      <i className="fas fa-arrow-left me-2"></i>Back to Email
                    </button>
                  </form>
                )}

                {/* Step 3: Reset Password */}
                {step === 3 && (
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">New Password</label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold" disabled={isLoading}>
                      {isLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</>
                      ) : (
                        <><i className="fas fa-lock me-2"></i>Reset Password</>
                      )}
                    </button>
                  </form>
                )}

                <hr className="my-4" />

                <div className="text-center">
                  <Link to="/" className="text-decoration-none">
                    <i className="fas fa-arrow-left me-2"></i>Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
