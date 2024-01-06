import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css";
import logo from "../logo.jpg";

function CoordLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:9000/coordinatorlogin", {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.removeItem("token");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", "coordinator");
        localStorage.setItem("userId", response.data.email);
        localStorage.setItem("coordinatorEmail", response.data.email); // Set coordinator's email
        setLoginSuccess(true);
        setTimeout(() => {
          navigate("/Teachers", { state: { id: email } });
        }, 2000);
      } else if (response.status === 204) {
        alert("User does not exist");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.log(error);
      alert("Error occurred during login");
    }
  };

  return (
    <div>
      {/* Sidebar */}
      <div className="sidebar">
  <h1 className="text-lg font-bold my-5 text-center">Final Year Project Portal</h1>
  <p className="my-1 text-center">Department of Computer Science</p>
  <p className="my-1 text-center">Quaid Azam University Islamabad</p>

  <div className="contact-details text-center mt-4">
    <p className="mb-2">Contact Us:</p>
    <p className="mb-1">Email: info@fypportal.com</p>
    
  </div>
</div>

      {/* Main content area */}
      <div className="main-content">
        <div className="login-container">
          <header className="header">
            <img
              src={logo}
              alt="QAU Logo"
              height="70"
              width="70"
            />
            <h3>Welcome to Web-FYP Portal</h3>
            
            <div className="header-buttons">
              <div className="button-group">
                <Link to="/" className="btn btn-primary">
                  Login as Student
                </Link>
                <Link to="/teacherlogin" className="btn btn-primary">
                  Login as Teacher
                </Link>
              </div>
            </div>
          </header>

          <div className="form-container">
            <h4 className="student-heading">Coordinator Login</h4>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary login-btn">
                Login
              </button>
            </form>
          </div>

          <footer className="footer">&copy; Copywrite 2023 FYP Portal</footer>
        </div>
      </div>
    </div>
  );
}

export default CoordLogin;
