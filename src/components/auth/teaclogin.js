import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "../../css/style.css";
import logo from "../../logo.jpg";

function TeachLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("teacherId");
    if (storedTeacherId) {
      setTeacherId(storedTeacherId);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/teacherlogin", {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("userId", response.data.teacherId);
        localStorage.setItem("username", response.data.teacherName);
        setLoginSuccess(true);
        setTimeout(() => {
          navigate("/uploads", { state: { teacherId: response.data.teacherId, teacherName: response.data.name } });
        }, 2000);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      {/* Enhanced Sidebar */}
      <div className="sidebar d-none d-lg-flex flex-column justify-content-between text-white p-3" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="text-center">
          <div className="mb-3">
            <img src={logo} alt="QAU Logo" className="rounded-circle shadow" style={{width: '60px', height: '60px'}} />
          </div>
          <h3 className="fw-bold mb-2 text-white">Final Year Project Portal</h3>
          <p className="mb-1 small text-white-50">Department of Computer Science</p>
          <p className="mb-1 small text-white-50">Quaid Azam University Islamabad</p>
        </div>

        <div className="text-center">
          <div className="p-2 rounded" style={{background: 'rgba(255,255,255,0.1)'}}>
            <h6 className="mb-1 fw-bold">Contact Us</h6>
            <p className="mb-0 small text-white-50">Email: info@fypportal.com</p>
            <p className="mb-0 small text-white-50">Phone: +92-51-9064-0000</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              {/* Header Section */}
              <div className="text-center mb-3">
                <div className="d-flex justify-content-center align-items-center mb-2">
                  <img src={logo} alt="QAU Logo" className="me-2 rounded-circle shadow" style={{width: '45px', height: '45px'}} />
                  <h3 className="fw-bold text-primary mb-0">Web-FYP Portal</h3>
                </div>
                <p className="text-muted mb-2">Empowering Teachers, Inspiring Innovation</p>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  <Link to="/" className="btn btn-outline-primary btn-sm px-3 py-1 rounded-pill shadow-sm">
                    <i className="fas fa-user-graduate me-1"></i>
                    Student Login
                  </Link>
                  <Link to="/coordlogin" className="btn btn-outline-success btn-sm px-3 py-1 rounded-pill shadow-sm">
                    <i className="fas fa-user-tie me-1"></i>
                    Coordinator Login
                  </Link>
                </div>
              </div>

              {/* Success Message */}
              {loginSuccess && (
                <div className="alert alert-success text-center mb-3 shadow-sm py-2" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  You have successfully logged in! Redirecting...
                </div>
              )}

              {/* Login Form Card */}
              <div className="card border-0 shadow rounded-3">
                <div className="card-header bg-primary text-white text-center py-3 rounded-top-3">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-chalkboard-teacher me-2"></i>
                    Teacher Login
                  </h5>
                </div>
                <div className="card-body p-3">
                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-bold text-dark small">
                        <i className="fas fa-envelope me-1 text-primary"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control border-2 rounded-3"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        style={{borderColor: '#e9ecef'}}
                      />
                      <div className="invalid-feedback">
                        Please enter a valid email address.
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label fw-bold text-dark small">
                        <i className="fas fa-lock me-1 text-primary"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control border-2 rounded-3"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        style={{borderColor: '#e9ecef'}}
                      />
                      <div className="invalid-feedback">
                        Please enter your password.
                      </div>
                    </div>
                    <div className="d-grid mb-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary rounded-3 shadow-sm fw-bold"
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
                    <div className="text-center mb-2">
                      <Link 
                        to="/forgot-password" 
                        className="text-decoration-none text-primary fw-semibold small"
                      >
                        <i className="fas fa-key me-1"></i>
                        Forgot Password?
                      </Link>
                    </div>
                  </form>
                </div>
              </div>

              {/* Signup Section */}
              <div className="text-center mt-3">
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body p-3">
                    <h6 className="text-muted mb-2 small">Don't have an account?</h6>
                    <div className="d-flex justify-content-center gap-2">
                      <Link to="/signup" className="btn btn-success btn-sm px-3 py-1 rounded-pill shadow-sm">
                        <i className="fas fa-user-plus me-1"></i>
                        Student Signup
                      </Link>
                      <Link to="/coordsignup" className="btn btn-info btn-sm px-3 py-1 rounded-pill shadow-sm">
                        <i className="fas fa-user-tie me-1"></i>
                        Coordinator Signup
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-3">
                <p className="text-muted mb-0 small">
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

export default TeachLogin;


