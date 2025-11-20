import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css";
import logo from "../logo.jpg";

function StudentProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [userType, setUserType] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    // Check for valid session
    const token = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");
    const storedStudentName = localStorage.getItem("studentName");

    if (!token || storedUserType !== "student") {
      localStorage.clear();
      navigate("/");
      return;
    }

    setUserType(storedUserType);
    setStudentName(storedStudentName || "");
    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8000/projects?posted=true");
      
      if (response.data.success) {
        // Check which projects the student has already requested
        const projectsWithStatus = response.data.projects.map(project => ({
          ...project,
          requestSent: false // You can implement this check based on your backend
        }));
        setProjects(projectsWithStatus);
      } else {
        toast.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Error fetching projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const handleSelectProject = async (project) => {
    try {
      // Send project selection request
      const response = await axios.post("http://localhost:8000/student/select-project", {
        studentId: localStorage.getItem("studentId"),
        projectId: project._id,
        teacherId: project.teacherId
      });

      if (response.data.success) {
        toast.success("Project selection request sent successfully!");
        // Update local state to show request sent
        setProjects(prev => prev.map(p => 
          p._id === project._id ? { ...p, requestSent: true } : p
        ));
      } else {
        toast.error(response.data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Error selecting project:", error);
      toast.error("Error sending project selection request");
    }
  };

  const handleViewProject = (project) => {
    // Navigate to project details or open project file
    navigate("/project-details", { state: { project } });
  };

  const openProjectFile = async (projectId, filename) => {
    try {
      const response = await fetch(`http://localhost:8000/projects/file/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const file = new Blob([blob], { type: "application/octet-stream" });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement("a");
        a.href = fileURL;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(fileURL);
        toast.success("Project file downloaded successfully!");
      } else {
        toast.error("Failed to download project file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading project file");
    }
  };

  return (
    <div style={{ backgroundColor: "#f7f7f7", minHeight: "100vh", padding: "10px" }}>
      {/* Compact Header */}
      <div className="header" style={{ backgroundColor: "#343a40", color: "#fff", padding: "15px", marginBottom: "15px" }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src={logo} alt="QAU Logo" height="50" width="50" />
            <div className="ms-3">
              <h4 className="mb-0">FYP Portal</h4>
              <small className="opacity-75">Student Project Selection</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success me-2">{studentName}</span>
            <span className="online-dot"></span>
            
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/student-dashboard")}>
                Dashboard
              </button>
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/my-selections")}>
                My Selections
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Projects Section */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white text-center py-2">
                <h5 className="mb-0">
                  <i className="fas fa-project-diagram me-2"></i>
                  Available Projects ({projects.length})
                </h5>
                <small className="opacity-75">Select projects that interest you</small>
              </div>
              
              <div className="card-body p-0">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading available projects...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-folder-open fa-2x text-muted mb-2"></i>
                    <h6 className="text-muted">No projects available</h6>
                    <p className="text-muted small">Projects will appear here once teachers upload them.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 px-3 py-2">
                            <i className="fas fa-user-tie me-1 text-primary"></i>Teacher
                          </th>
                          <th className="border-0 px-3 py-2">
                            <i className="fas fa-project-diagram me-1 text-success"></i>Project Details
                          </th>
                          <th className="border-0 px-3 py-2 text-center">
                            <i className="fas fa-cogs me-1 text-warning"></i>Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => (
                          <tr key={project._id} className="align-middle">
                            <td className="px-3 py-2">
                              <div className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                     style={{width: '30px', height: '30px'}}>
                                  <i className="fas fa-user-tie fa-sm"></i>
                                </div>
                                <div>
                                  <div className="fw-bold small">{project.teacherName}</div>
                                  <small className="text-muted">{project.teacherEmail}</small>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div>
                                <div className="fw-bold text-dark mb-1">{project.projectName}</div>
                                <div className="text-muted small mb-1">
                                  <i className="fas fa-tags me-1"></i>
                                  {project.projectDomain}
                                </div>
                                <div className="text-muted small">
                                  <i className="fas fa-align-left me-1"></i>
                                  {project.projectDescription?.substring(0, 100)}...
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="btn-group btn-group-sm" role="group">
                                <button
                                  className="btn btn-outline-info btn-sm"
                                  onClick={() => handleViewProject(project)}
                                  title="View Project Details"
                                >
                                  <i className="fas fa-eye fa-sm"></i> Details
                                </button>
                                
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => openProjectFile(project._id, project.projectFile)}
                                  title="Download Project File"
                                >
                                  <i className="fas fa-download fa-sm"></i> Download
                                </button>
                                
                                <button
                                  className={`btn btn-sm ${project.requestSent ? "btn-secondary disabled" : "btn-success"}`}
                                  onClick={() => handleSelectProject(project)}
                                  disabled={project.requestSent}
                                  title={project.requestSent ? "Request Already Sent" : "Select This Project"}
                                >
                                  <i className={`fas fa-sm ${project.requestSent ? "fa-check" : "fa-hand-pointer"}`}></i>
                                  {project.requestSent ? "Request Sent" : "Select"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default StudentProjects; 