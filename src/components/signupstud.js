import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../css/style.css";
import logo from "../logo.jpg";

// Validation functions
const emailValidator = email => {
  if (!email) {
    return "Email is required";
  } else if (!new RegExp(/\S+@\S+\.\S+/).test(email)) {
    return "Incorrect email format";
  }
  return "";
};

const passwordValidator = password => {
  if (!password) {
    return "Password is required";
  } else if (password.length < 8) {
    return "Password must have a minimum of 8 characters";
  }
  return "";
};

const nameValidator = name => {
  if (!name) {
    return "Name is required";
  } else if (!/^[a-zA-Z\s]*$/.test(name)) {
    return "Name must contain only letters and spaces";
  }
  return "";
};

const idValidator = id => {
  if (!id) {
    return "ID is required";
  } else if (isNaN(id) || id.length < 7) {
    return "ID should be a number and at least 7 digits long";
  }
  return "";
};

function Signup() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const nameError = nameValidator(name);
    const idError = idValidator(id);
    const emailError = emailValidator(email);
    const passwordError = passwordValidator(password);
  
    if (nameError || idError || emailError || passwordError) {
      setFormErrors({ name: nameError, id: idError, email: emailError, password: passwordError });
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:9000/signup/student", {
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
    }
  };
  


  return (
    <div className="login-container">
      <div className="sidebar">
        <h1 className="text-lg font-bold my-5 text-center">Final Year Project Portal</h1>
        <p className="my-1 text-center">Department of Computer Science</p>
        <p className="my-1 text-center">Quaid Azam University Islamabad</p>

        <div className="contact-details text-center mt-4">
          <p className="mb-2">Contact Us:</p>
          <p className="mb-1">Email: info@fypportal.com</p>
         
        </div>
      </div>
      <header className="header">
        <img src={logo} alt="QAU Logo" height="70" width="70" />
        <h3>Welcome to FYP Portal</h3>
        <div className="header-buttons">
          <div className="button-group">
            <Link to="/" className="btn btn-primary">
              Login as Student
            </Link>
            <Link to="/teacherlogin" className="btn btn-primary">
              Login as Teacher
            </Link>
            <Link to="/coologin" className="btn btn-primary">
              Login as Coordinator
            </Link>
          </div>
        </div>
        {signupSuccess && (
          <div className="signup-alert">You have successfully signed up!</div>
        )}
        <div className="header-buttons"></div>
      </header>
      <br />
      <br />
      <div className="form-cont">
        <h4 className="student-heading">Student Signup</h4>
        <form onSubmit={handleSubmit} className="login">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
            />
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="id">ID</label>
            <input
              type="text"
              className="form-control"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ID"
              required
            />
            {formErrors.id && <div className="error-message">{formErrors.id}</div>}
          </div>
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
            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
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
            {formErrors.password && <div className="error-message">{formErrors.password}</div>}
          </div>
          <button type="submit" className="btn btn-primary login-btn">
            Signup
          </button>

          <div className="signup-button">
            <div className="signup-text">
              <p>Already have an account?</p>
            </div>
            <div className="login-link">
              <Link to="/" className="btn btn-primary">
                Login
              </Link>
            </div>
          </div>
        </form>
      </div>
      <br /><br />
      <footer className="footer">&copy; Copyright 2023 FYP Portal</footer>
    </div>
  );
}

export default Signup;
