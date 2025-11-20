import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "../../css/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../logo.jpg";

function StudLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const storedStudentId = localStorage.getItem("studentId");
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error("Email is required", { position: toast.POSITION.TOP_CENTER });
      return false;
    }
    if (!password.trim()) {
      toast.error("Password is required", { position: toast.POSITION.TOP_CENTER });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", { position: toast.POSITION.TOP_CENTER });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/studentlogin", {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", "student");
        localStorage.setItem("userId", response.data.id);
        localStorage.setItem("studentId", studentId);
        localStorage.setItem("studentId", response.data.studentId);
        localStorage.setItem("studentName", response.data.studentName);

        setLoginSuccess(true);
        toast.success("Login successful! Redirecting... 🎉", { position: toast.POSITION.TOP_CENTER });

        setTimeout(() => {
          navigate("/projects", { state: { studentId: response.data.id } });
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      toast.error("Invalid email or password. Please try again.", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      <div className="sidebar d-none d-lg-flex flex-column justify-content-between text-white p-3" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="text-center">
          <div className="mb-3">
            <img src={logo} alt="QAU Logo" className="rounded-circle shadow" style={{width: '60px', height: '60px'}} />
          </div>
          <h3 className="fw-bold mb-2 text-white">Final Year Project Portal</h3>
          <p className="mb-2 fw-bold text-white fs-5" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
            Department of Computer Science
          </p>
          <p className="mb-1 fw-bold text-white fs-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
            Quaid Azam University Islamabad
          </p>
        </div>

        <div className="text-center">
          <div className="p-3 rounded" style={{background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}}>
            <h6 className="mb-2 fw-bold">Contact Us</h6>
            <p className="mb-1 small text-white-50">
              <i className="fas fa-envelope me-2"></i>info@fypportal.com
            </p>
            <p className="mb-0 small text-white-50">
              <i className="fas fa-phone me-2"></i>+92-51-9064-0000
            </p>
          </div>
        </div>
      </div>

      <div className="main-content flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="text-center mb-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <img src={logo} alt="QAU Logo" className="me-3 rounded-circle shadow" style={{width: '60px', height: '60px'}} />
                  <h2 className="fw-bold text-primary mb-0">Web-FYP Portal</h2>
                </div>
                <p className="text-muted mb-3 fs-5">Welcome to the Future of Project Management</p>

                <div className="d-flex justify-content-center gap-3 mb-4">
                  <Link to="/teacherlogin" className="btn btn-outline-primary px-4 py-2 rounded-pill shadow-sm">
                    <i className="fas fa-chalkboard-teacher me-2"></i>
                    Teacher Login
                  </Link>
                  <Link to="/coordlogin" className="btn btn-outline-success px-4 py-2 rounded-pill shadow-sm">
                    <i className="fas fa-user-tie me-2"></i>
                    Coordinator Login
                  </Link>
                </div>
              </div>

              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-header bg-gradient-primary text-white text-center py-4 rounded-top-4">
                  <h4 className="mb-0 fw-bold">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Student Login
                  </h4>
                  <p className="mb-0 mt-2 opacity-75">Access your FYP projects and resources</p>
                </div>
                <div className="card-body p-4">
                  {loginSuccess ? (
                    <div className="text-center py-4">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                           style={{width: '80px', height: '80px'}}>
                        <i className="fas fa-check fa-3x"></i>
                      </div>
                      <h5 className="text-success mb-2">Login Successful!</h5>
                      <p className="text-muted">Redirecting to your dashboard...</p>
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                      <div className="mb-4">
                        <label htmlFor="email" className="form-label fw-bold text-dark">
                          <i className="fas fa-envelope me-2 text-primary"></i>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg border-2 rounded-3"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                          style={{borderColor: '#e9ecef'}}
                        />
                        <div className="invalid-feedback">
                          Please enter a valid email address.
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password" className="form-label fw-bold text-dark">
                          <i className="fas fa-lock me-2 text-primary"></i>
                          Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control form-control-lg border-2 rounded-start-3"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={{borderColor: '#e9ecef'}}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary border-2 border-start-0 rounded-end-3"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{borderColor: '#e9ecef'}}
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        <div className="invalid-feedback">
                          Please enter your password.
                        </div>
                      </div>

                      <div className="d-grid mb-3">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg rounded-3 shadow-sm fw-bold"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Signing In...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-sign-in-alt me-2"></i>
                              Sign In
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-center">
                        <Link to="/forgotpwd" className="text-decoration-none">
                          <small className="text-primary">
                            <i className="fas fa-question-circle me-1"></i>
                            Forgot your password?
                          </small>
                        </Link>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              <div className="text-center mt-4">
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-3">
                    <h6 className="text-muted mb-2">New to FYP Portal?</h6>
                    <Link to="/signup" className="btn btn-outline-success px-4 py-2 rounded-pill shadow-sm">
                      <i className="fas fa-user-plus me-2"></i>
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-muted mb-0 small">
                  <i className="fas fa-copyright me-1"></i>
                  2024 FYP Portal. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default StudLogin;


