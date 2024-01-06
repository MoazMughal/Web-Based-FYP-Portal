import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../logo.jpg";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css"; // Import the updated style.css
import axios from "axios";


function Archive() {
  const navigate = useNavigate();
  const [archiveProjects, setArchiveProjects] = useState([]);

  useEffect(() => {
    // Fetch archive projects when the component mounts
    axios
      .get("http://localhost:8000/archive-projects")
      .then((response) => {
        setArchiveProjects(response.data.projects);
      })
      .catch((error) => {
        console.error("Error fetching archive projects:", error);
      });
  }, []); // Empty dependency array ensures the effect runs only once on mount

  // Get unique years from archived projects
  const uniqueYears = [...new Set(archiveProjects.map((project) => project.year))];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Coologin");
  };
  return (
    <div className="assigned-container">
    
      <header className="header">
        <img src={logo} alt="QAU Logo" height="70" width="70" />
        <h3>Welcome to FYP Portal</h3>
        <Link to="/Teachers" className="btn btn-primary">
          Home
        </Link>
        <Link to="/AddTeach" className="btn btn-primary">
          Add Teachers
        </Link>
        <Link to="/projects" className="btn btn-primary">
          Projects
        </Link>
        <Link to="/assigned" className="btn btn-primary ml-2">
          Assign Projects
        </Link>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <br />
      <br />
      <br />
      <br />
      <div className="main-content">
        <h3>Archived Projects</h3>

        {/* Generate tables for each unique year */}
        {uniqueYears.map((year) => (
          <div key={year}>
            <h4>{year}</h4>
            <table className="table">
              <thead>
                <tr>
                  <th className="p-3 mb-2 bg-success text-white">Teacher Name</th>
                  <th className="p-3 mb-2 bg-success text-white">Project Name</th>
                  <th className="p-3 mb-2 bg-success text-white">Student Name</th>
                  <th className="p-3 mb-2 bg-success text-white">Semester</th>
                  <th className="p-3 mb-2 bg-success text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {archiveProjects
                  .filter((project) => project.year === year)
                  .map((project) => (
                    <tr key={project._id}>
                      <td>{project.teacherName}</td>
                      <td>{project.projectName}</td>
                      <td>{project.studentName}</td>
                      <td>{project.semester}</td>
                      <td>
                        <b>{new Date(project.assignmentDate).toLocaleDateString()}</b>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      {/* ...Footer and other JSX code... */}
    </div>
  );
}

export default Archive;