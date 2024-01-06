import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css";
import logo from "../logo.jpg";

function StudLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    const storedStudentId = localStorage.getItem("studentId");
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:9000/studentlogin", {
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
        setTimeout(() => {
          navigate("/projects", { state: { studentId: response.data.id } });
        }, 2000);
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
          <div className="header">
            <img src={logo} alt="QAU Logo" height="70" width="70" />
            <h3>Welcome to Web-FYP Portal</h3>
            {loginSuccess && (
              <div className="login-success text-center">You have successfully logged in!</div>
            )}
            <div className="header-buttons">
              <div className="button-group">
                <Link to="/teacherlogin" className="btn btn-primary">
                  Login as Teacher
                </Link>
                <Link to="/coologin" className="btn btn-primary">
                  Login as Coordinator
                </Link>
              </div>
            </div>
          </div>

          <div className="form-container">
            <h4 className="student-heading">Student Login</h4>
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
              <button
                type="button"
                className="btn btn-link forgot-password-btn"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </button>
            </form>

            <div className="signup-button text-center">
              <Link to="/signup" className="btn btn-primary">
                Signup
              </Link>
              <p className="mt-3">Don't have an account? Signup</p>
            </div>
          </div>

          <footer className="footer">
            &copy; Copyright 2023 FYP Portal
          </footer>
        </div>
      </div>
    </div>
  );
}

export default StudLogin;

