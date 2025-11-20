import React, { useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../logo.jpg";
import "../../css/style.css";

function Verify() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post('http://localhost:8000/verify-code', { code: verificationCode });
      if (response.data.valid) {
        setIsCodeValid(true);
        toast.success("Code verified");
      } else {
        setIsCodeValid(false);
        toast.error("Invalid code");
      }
    } catch (error) {
      console.error(error);
      toast.error("Verification failed");
    }
  };

  const handlePasswordChange = () => {
    if (password === confirmPassword) {
      setPasswordMatch(true);
      toast.success('Password changed successfully');
    } else {
      setPasswordMatch(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-3" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
      <div className="text-center mb-3">
        <img src={logo} alt="QAU Logo" className="rounded-circle shadow" style={{width: '60px', height: '60px'}} />
      </div>
      <div className="card border-0 shadow rounded-3" style={{maxWidth: 500, width: '100%'}}>
        <div className="card-header bg-warning text-dark text-center py-3 rounded-top-3">
          <h5 className="mb-0 fw-bold">
            <i className="fas fa-key me-2"></i>
            Reset Password (Verify Code)
          </h5>
        </div>
        <div className="card-body p-3">
          <div className="mb-3">
            <label className="form-label fw-bold small">Verification Code</label>
            <input
              type="text"
              className="form-control"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 4-6 digit code"
            />
          </div>
          <div className="d-grid gap-2 mb-3">
            <button className="btn btn-warning" onClick={handleVerifyCode}>Verify Code</button>
            <Link to="/forgot-password" className="btn btn-outline-secondary">Back</Link>
          </div>

          {isCodeValid && (
            <div className="mt-3">
              <h6 className="fw-bold">Change Password</h6>
              <input
                type="password"
                className="form-control mb-2"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {!passwordMatch && <p className="text-danger small">Passwords do not match</p>}
              <button className="btn btn-success" onClick={handlePasswordChange}>Change Password</button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Verify;


