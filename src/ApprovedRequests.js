import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import logo from "./logo.jpg";

function ApprovedRequest() {
  const navigate = useNavigate();
  const [approvedProjects, setApprovedProjects] = useState([]);

  const fetchApprovedProjects = async () => {
    try {
      const response = await axios.get("http://localhost:8000/approved-projects");
      const data = response.data;
      if (data.success) {
        setApprovedProjects(data.approvedProjects);
      } else {
        console.error("Error fetching approved projects");
      }
    } catch (error) {
      console.error("Error fetching approved projects:", error);
    }
  };

  useEffect(() => {
    fetchApprovedProjects();
  }, []);

 const assignProject = async (projectId) => {
  try {
    const response = await axios.post(`http://localhost:8000/assigned-projects/${projectId}`);

    if (response.data.success) {
      toast.success("Project assigned successfully");
      fetchApprovedProjects(); // Refresh the project list
    } else {
      toast.error("Error assigning the project to the student");
    }
  } catch (error) {
    console.error("Error assigning project:", error);
    toast.error("Error assigning the project to the student");
  }
};

const removeProject = async (projectId) => {
  try {
    const response = await axios.delete(`http://localhost:8000/requests/${projectId}`);

    if (response.data.success) {
      toast.success("Project removed successfully");
      fetchApprovedProjects(); // Refresh the project list
    } else {
      toast.error("Error removing the project");
    }
  } catch (error) {
    console.error("Error removing project:", error);
    toast.error("Error removing the project");
  }
};


  return (
    <div>
      <div className="header">
        <img src={logo} alt="QAU Logo" height="70" width="70" />
        <h3>Welcome to FYP Portal</h3>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={() => navigate("/Teachers")}>
            Teachers
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/ApprovedRequests")}>
            Approved Requests
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/assigned")}>
            Assigned Projects
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="container">
          <br /><br /><br />
          <h2 className="text-center">Approved Project Requests</h2>
          <div className="table-responsive">
            <table className="table mx-auto">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Project Name</th>
                  <th>Teacher Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedProjects?.map((project) => (
                  <tr key={project._id}>
                    <td>{project.studentName}</td>
                    <td>{project.projectName}</td>
                    <td>{project.teacherName ? project.teacherName : "Not Assigned"}</td>
                    <td>{project.status}</td>
                    <td>
                      <button className="btn btn-success" onClick={() => assignProject(project._id)}>
                        Assign
                      </button>
                      <button className="btn btn-danger" onClick={() => removeProject(project._id)}>
          Remove
        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <footer className="footer mt-auto py-3">
        {/* ... (Your footer content) ... */}
      </footer>
      <ToastContainer />
    </div>
  );
}

export default ApprovedRequest;