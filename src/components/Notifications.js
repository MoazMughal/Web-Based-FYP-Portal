import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../logo.jpg";

function Notifications() {
  const [assignedProjects, setAssignedProjects] = useState([]);
  const userType = localStorage.getItem("userType");
  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const response = await axios.get("http://localhost:8000/assigned-projects");
        if (response.data.success) {
          setAssignedProjects(response.data.projects);
        }
      } catch (error) {
        console.error("Error fetching assigned projects:", error);
      }
    };
    fetchAssigned();
  }, []);
  

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-gradient-info text-white text-center py-3 rounded-top-4">
              <h4 className="mb-0 fw-bold">
                <i className="fas fa-bell me-2"></i>
                Project Assignment Notifications
              </h4>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Project Name</th>
                      <th>Teacher</th>
                      <th>Student</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedProjects.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">No assignments yet</td>
                      </tr>
                    ) : (
                      assignedProjects.map((project) => (
                        <tr key={project._id}>
                          <td>{project.projectName}</td>
                          <td>{project.teacherName}</td>
                          <td>{project.studentName}</td>
                          <td>
                            <span className="badge bg-success-subtle text-success">{project.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;