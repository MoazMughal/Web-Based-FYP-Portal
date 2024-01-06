import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import logo from "../logo.jpg"; // Make sure to replace 'path-to-your-logo' with the actual path to your logo image

function ForgetPsw() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [verificationStep, setVerificationStep] = useState(0); // 0: Email, 1: Code, 2: Password
  const navigate = useNavigate();
  const loginSuccess = false; // Change this according to your login logic

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required", { position: toast.POSITION.TOP_CENTER });
      return; // Exit early if email is empty
    }
  
    try {
      const responseStudent = await axios.post('http://localhost:9000/check-student-email', { email });
      const responseTeacher = await axios.post('http://localhost:9000/check-email', { email });

      if (responseStudent.data.valid) {
        const studentVerificationCode = Math.floor(1000 + Math.random() * 9000);
        setGeneratedCode(studentVerificationCode);
        toast.success("Student Email is Valid", { position: toast.POSITION.TOP_CENTER });
        setIsCodeVerified(true);
        setVerificationStep(1);
      } else if (responseTeacher.data.valid) {
        const teacherVerificationCode = Math.floor(1000 + Math.random() * 9000);
        setGeneratedCode(teacherVerificationCode);
        toast.success("Teacher Email is Valid", { position: toast.POSITION.TOP_CENTER });
        setIsCodeVerified(true);
        setVerificationStep(1);
      } else {
        // Email is neither a valid student's nor a teacher's
        toast.error("Invalid email", { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred", { position: toast.POSITION.TOP_CENTER });
    }
  };
  

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:9000/verify-code', { code: verificationCode });
      if (response.data.valid) {
        toast.success("Verification code is valid", { position: toast.POSITION.TOP_CENTER });
        setIsCodeVerified(true);
        setVerificationStep(2);
      } else {
        toast.error("Invalid verification code", { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred", { position: toast.POSITION.TOP_CENTER });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword === confirmPassword) {
      try {
        // Send the email, verification code, and new password to reset the password
        const response = await axios.post('http://localhost:9000/reset-password', { email, verificationCode, newPassword });

        if (response.data.success) {
          toast.success("Password Reset Successfully", { position: toast.POSITION.TOP_CENTER });
          // Redirect to a success page or login page
          // Assuming there's a login page
        } else {
          toast.error(response.data.message, { position: toast.POSITION.TOP_CENTER });
        }
      } catch (error) {
        console.log(error);
        toast.error("An error occurred", { position: toast.POSITION.TOP_CENTER });
      }
    } else {
      toast.error("Passwords do not match", { position: toast.POSITION.TOP_CENTER });
    }
  };

  const handleLogin = () => {
    // Redirect to the login page
    navigate('/teacherlogin');
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      <div className="sidebar">
        <h1 className="text-lg font-bold my-5 text-center">Final Year Project Portal</h1>
        <p className="my-1 text-center">Department of Computer Science</p>
        <p className="my-1 text-center">Quaid Azam University Islamabad</p>

        <div className="contact-details text-center mt-4">
          <p className="mb-2">Contact Us:</p>
          <p className="mb-1">Email: info@fypportal.com</p>
          <p className="mb-1">Phone: +1234567890</p>
          <p className="mb-1">Address: ABC Street, XYZ City</p>
        </div>
      </div>
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
          <div className="bg-white p-3 rounded form-container">
            <h4 className="mb-3">Forgot Password</h4>
            {verificationStep === 0 && (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter Email"
                    autoComplete="off"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="success" className="btn-form">
                  Verify
                </Button>
                
              </Form>
            )}
            {verificationStep === 1 && (
              <Form onSubmit={handleVerifyCode}>
                <Form.Group className="mb-3">
                  <Form.Label>Verification Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Verification Code"
                    autoComplete="off"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="success" className="btn-form">
                  Verify Code
                </Button>
                <Button variant="primary" className="btn-form" onClick={handleLogin}>
                  Login
                </Button>
              </Form>
            )}
            {verificationStep === 2 && (
              <Form onSubmit={handlePasswordReset}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="New Password"
                    autoComplete="off"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm Password"
                    autoComplete="off"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {!passwordMatch && <p className="text-danger">Passwords do not match</p>}
                </Form.Group>
                <Button type="submit" variant="success" className="btn-form">
                  Reset Password
                </Button>
                <Button variant="primary" className="btn-form" onClick={handleLogin}>
                  Login
                </Button>
              </Form>
            )}
            <footer className="footer">
            &copy; Copyright 2023 FYP Portal
          </footer>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ForgetPsw;