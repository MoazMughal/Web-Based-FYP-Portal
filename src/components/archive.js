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
            navigate("/coordlogin");
  };
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-gradient-warning text-dark text-center py-3 rounded-top-4">
              <h4 className="mb-0 fw-bold"><i className="fas fa-archive me-2"></i>Archived Projects</h4>
            </div>
            <div className="card-body">
              {uniqueYears.length === 0 ? (
                <div className="text-center text-muted py-4">No archived projects yet</div>
              ) : (
                uniqueYears.map((year) => (
                  <div key={year} className="mb-4">
                    <h5 className="fw-bold text-secondary">{year}</h5>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Teacher Name</th>
                            <th>Project Name</th>
                            <th>Student Name</th>
                            <th>Semester</th>
                            <th>Date</th>
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
                                <td><b>{new Date(project.assignmentDate).toLocaleDateString()}</b></td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Archive;