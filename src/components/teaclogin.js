import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "tailwindcss/tailwind.css";
import "../css/style.css";
import logo from "../logo.jpg";

function TeachLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("teacherId");
    if (storedTeacherId) {
      setTeacherId(storedTeacherId);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:9000/teacherlogin", {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("userId", response.data.teacherId);
        localStorage.setItem("username", response.data.teacherName);
        navigate("/uploads");
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
              <Link to="/Coologin" className="btn btn-primary">
                Login as Coordinator
              </Link>
            </div>
          </div>
        </header>

        <div className="form-container">
          <h4 className="student-heading">Teacher Login</h4>
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
        </div>

        <footer className="footer">&copy; Copywrite 2023 FYP Portal</footer>
      </div>
    </div>
    </div>
  );
}

export default TeachLogin;
