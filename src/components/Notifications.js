import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../logo.jpg";

function Notifications() {
  const navigate = useNavigate();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const studentName = localStorage.getItem("studentName");
  const studentId = localStorage.getItem("studentId");
  const userType = localStorage.getItem("userType");
  useEffect(() => {
    fetchAssignedProjects(studentName);
  }, [studentName]);

  const fetchAssignedProjects = async (studentName) => {
    try {
      const response = await axios.get(`http://localhost:8000/assigned/${studentName}`);
      if (response.data.success) {
        console.log(response.data.projects); // Log the response data
        setAssignedProjects(response.data.projects);
      } else {
        console.log("Error fetching assigned projects");
      }
    } catch (error) {
      console.error(error);
      console.log("Error fetching assigned projects");
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>      
      <header className="header">
      <img
          src={logo}
          alt="QAU Logo"
          height="70"
          width="70"
        />
        <h3>Welcome to FYP Portal</h3>
        {userType === "student" && (
          <div className="header-info student-info">
            {/* Display student name with online status */}
            {localStorage.getItem("studentName")} <span className="online-dot"></span>
          </div>
        )}
        {userType === "teacher" && (
          <div className="header-info">Teacher ID: {localStorage.getItem("userId")}</div>
        )}
        {userType === "coordinator" && (
          <div className="header-info">
            Coordinator Email: {localStorage.getItem("coordinatorEmail")}
          </div>
        )}
        <div className="header-buttons">
          {/* Navigation links based on user type */}
         
          <Link to="/projects" className="btn btn-primary">
            Projects
          </Link>
          
          <Link to="/Notifications" className="btn btn-primary">
            Notifications
          </Link>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <br />
      <br />
      <br />
      <br />
      <div className="content-container">
        <center>
          <h2>Approved Project Selection Notifications</h2>
        </center>
        <table className="table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Teacher Name</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignedProjects.map((project) => (
              <tr key={project._id}>
                <td>{project.projectName}</td>
                <td>{project.teacherName}</td>
                <td>{project.studentName}</td>
                <td
                  style={{
                    color: "white",
                    backgroundColor: project.status === "Assigned" ? "green" : "inherit",
                    fontWeight: project.status === "Assigned" ? "bold" : "normal",
                  }}
                >
                  {project.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="footer">
        {/* ... footer code ... */}
      </footer>
    </div>
  );
}

export default Notifications;