import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "../../css/style.css";
import logo from "../../logo.jpg";

function CoordSignup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/signup/coordinator", {
        email,
        password,
      });

      if (response.data === "notexist") {
        setSignupSuccess(true);
        setTimeout(() => {
          navigate("/coordlogin");
        }, 2000);
      } else if (response.data === "exist") {
        setError("Coordinator with this email already exists");
      } else {
        setError("Signup failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError("Error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      <div className="sidebar d-none d-lg-flex flex-column justify-content-between text-white p-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="text-center">
          <div className="mb-4">
            <img src={logo} alt="QAU Logo" className="rounded-circle shadow-lg" style={{width: '80px', height: '80px'}} />
          </div>
          <h2 className="fw-bold mb-3 text-white">Final Year Project Portal</h2>
          <p className="mb-2 text-white-50">Department of Computer Science</p>
          <p className="mb-2 text-white-50">Quaid Azam University Islamabad</p>
        </div>
        <div className="text-center">
          <div className="p-3 rounded" style={{background: 'rgba(255,255,255,0.1)'}}>
            <h6 className="mb-2 fw-bold">Contact Us</h6>
            <p className="mb-1 small text-white-50">Email: info@fypportal.com</p>
            <p className="mb-0 small text-white-50">Phone: +92-51-9064-0000</p>
          </div>
        </div>
      </div>

      <div className="main-content flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="text-center mb-5">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <img src={logo} alt="QAU Logo" className="me-3 rounded-circle shadow" style={{width: '60px', height: '60px'}} />
                  <h2 className="fw-bold text-primary mb-0">Web-FYP Portal</h2>
                </div>
                <p className="text-muted fs-5">Administrative Excellence in Project Coordination</p>
                <div className="d-flex justify-content-center gap-3 mb-4">
                  <Link to="/" className="btn btn-outline-primary px-4 py-2 rounded-pill shadow-sm">
                    <i className="fas fa-user-graduate me-2"></i>
                    Student Login
                  </Link>
                  <Link to="/teacherlogin" className="btn btn-outline-success px-4 py-2 rounded-pill shadow-sm">
                    <i className="fas fa-chalkboard-teacher me-2"></i>
                    Teacher Login
                  </Link>
                  <Link to="/coordlogin" className="btn btn-outline-info px-4 py-2 rounded-pill shadow-sm">
                    <i className="fas fa-user-tie me-2"></i>
                    Coordinator Login
                  </Link>
                </div>
              </div>

              {signupSuccess && (
                <div className="alert alert-success text-center mb-4 shadow-sm" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  Coordinator account created successfully! Redirecting to login...
                </div>
              )}

              {error && (
                <div className="alert alert-danger text-center mb-4 shadow-sm" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <div className="card border-0 shadow-lg rounded-3">
                <div className="card-header bg-warning text-dark text-center py-4 rounded-top-3">
                  <h4 className="mb-0 fw-bold">
                    <i className="fas fa-user-tie me-2"></i>
                    Coordinator Registration
                  </h4>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <div className="mb-4">
                      <label htmlFor="email" className="form-label fw-bold text-dark">
                        <i className="fas fa-envelope me-2 text-warning"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg border-2 rounded-3"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter coordinator email"
                        required
                        style={{borderColor: '#e9ecef'}}
                      />
                      <div className="invalid-feedback">
                        Please enter a valid email address.
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="password" className="form-label fw-bold text-dark">
                        <i className="fas fa-lock me-2 text-warning"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg border-2 rounded-3"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (min 6 characters)"
                        required
                        style={{borderColor: '#e9ecef'}}
                      />
                      <div className="invalid-feedback">
                        Please enter a password with at least 6 characters.
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label fw-bold text-dark">
                        <i className="fas fa-lock me-2 text-warning"></i>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg border-2 rounded-3"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                        style={{borderColor: '#e9ecef'}}
                      />
                      <div className="invalid-feedback">
                        Please confirm your password.
                      </div>
                    </div>
                    <div className="d-grid mb-3">
                      <button 
                        type="submit" 
                        className="btn btn-warning btn-lg rounded-3 shadow-sm fw-bold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus me-2"></i>
                            Create Coordinator Account
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="text-center mt-4">
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body p-4">
                    <h6 className="text-muted mb-3">Already have an account?</h6>
                    <Link to="/coordlogin" className="btn btn-info px-4 py-2 rounded-pill shadow-sm">
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Login here
                    </Link>
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                <p className="text-muted mb-0">
                  <i className="fas fa-copyright me-1"></i>
                  2024 FYP Portal. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoordSignup;


