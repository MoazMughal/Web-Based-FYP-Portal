import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "../../css/style.css";
import logo from "../../logo.jpg";

const emailValidator = email => {
  if (!email) return "Email is required";
  if (!new RegExp(/\S+@\S+\.\S+/).test(email)) return "Incorrect email format";
  return "";
};

const passwordValidator = password => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must have a minimum of 8 characters";
  return "";
};

const nameValidator = name => {
  if (!name) return "Name is required";
  if (!/^[a-zA-Z\s]*$/.test(name)) return "Name must contain only letters and spaces";
  return "";
};

const idValidator = id => {
  if (!id) return "ID is required";
  if (isNaN(id) || id.length < 7) return "ID should be a number and at least 7 digits long";
  return "";
};

function Signup() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const nameError = nameValidator(name);
    const idError = idValidator(id);
    const emailError = emailValidator(email);
    const passwordError = passwordValidator(password);

    if (nameError || idError || emailError || passwordError) {
      setFormErrors({ name: nameError, id: idError, email: emailError, password: passwordError });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/signup/student", {
        userType: "student",
        name,
        studentId: id,
        email,
        password,
      });

      if (response.data === "exist") {
        setFormErrors({
          email: "User with this email already exists",
          id: "User with this ID already exists",
        });
      } else if (response.data === "notexist") {
        setSignupSuccess(true);
      }
    } catch (error) {
      console.log(error);
      alert("Error occurred during signup");
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
                <p className="text-muted mb-2">Join the Future of Project Management</p>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  <Link to="/" className="btn btn-outline-primary btn-sm px-3 py-1 rounded-pill shadow-sm">
                    <i className="fas fa-user-graduate me-1"></i>
                    Student Login
                  </Link>
                  <Link to="/teacherlogin" className="btn btn-outline-success btn-sm px-3 py-1 rounded-pill shadow-sm">
                    <i className="fas fa-chalkboard-teacher me-1"></i>
                    Teacher Login
                  </Link>
                  <Link to="/coordlogin" className="btn btn-outline-info btn-sm px-3 py-1 rounded-pill shadow-sm">
                    <i className="fas fa-user-tie me-1"></i>
                    Coordinator Login
                  </Link>
                </div>
              </div>

              {signupSuccess && (
                <div className="alert alert-success text-center mb-3 shadow-sm py-2" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  Account created successfully! You can now login.
                </div>
              )}

              <div className="card border-0 shadow rounded-3">
                <div className="card-header bg-success text-white text-center py-3 rounded-top-3">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-user-plus me-2"></i>
                    Student Registration
                  </h5>
                </div>
                <div className="card-body p-3">
                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label fw-bold text-dark small">
                          <i className="fas fa-user me-1 text-success"></i>
                          Full Name
                        </label>
                        <input
                          type="text"
                          className={`form-control border-2 rounded-3 ${formErrors.name ? 'is-invalid' : ''}`}
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                          style={{borderColor: '#e9ecef'}}
                        />
                        {formErrors.name && (
                          <div className="invalid-feedback">{formErrors.name}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="id" className="form-label fw-bold text-dark small">
                          <i className="fas fa-id-card me-1 text-success"></i>
                          Student ID
                        </label>
                        <input
                          type="text"
                          className={`form-control border-2 rounded-3 ${formErrors.id ? 'is-invalid' : ''}`}
                          id="id"
                          value={id}
                          onChange={(e) => setId(e.target.value)}
                          placeholder="Enter your student ID"
                          required
                          style={{borderColor: '#e9ecef'}}
                        />
                        {formErrors.id && (
                          <div className="invalid-feedback">{formErrors.id}</div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-bold text-dark small">
                        <i className="fas fa-envelope me-1 text-success"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className={`form-control border-2 rounded-3 ${formErrors.email ? 'is-invalid' : ''}`}
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        style={{borderColor: '#e9ecef'}}
                      />
                      {formErrors.email && (
                        <div className="invalid-feedback">{formErrors.email}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label fw-bold text-dark small">
                        <i className="fas fa-lock me-1 text-success"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        className={`form-control border-2 rounded-3 ${formErrors.password ? 'is-invalid' : ''}`}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        style={{borderColor: '#e9ecef'}}
                      />
                      {formErrors.password && (
                        <div className="invalid-feedback">{formErrors.password}</div>
                      )}
                    </div>
                    <div className="d-grid mb-2">
                      <button 
                        type="submit" 
                        className="btn btn-success rounded-3 shadow-sm fw-bold"
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
                            Create Account
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="text-center mt-3">
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body p-3">
                    <h6 className="text-muted mb-2 small">Already have an account?</h6>
                    <Link to="/" className="btn btn-primary btn-sm px-4 py-1 rounded-pill shadow-sm">
                      <i className="fas fa-sign-in-alt me-1"></i>
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>

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

export default Signup;


