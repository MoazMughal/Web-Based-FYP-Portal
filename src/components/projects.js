import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../logo.jpg";

function Projects() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [projects, setProjects] = useState([]);
  const [coordinatorEmail, setCoordinatorEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [editRequestMessage, setEditRequestMessage] = useState("");
  const [showEditRequestInput, setShowEditRequestInput] = useState(false);
  const [openedProjectId, setOpenedProjectId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    } else {
      const storedUserType = localStorage.getItem("userType");
      const storedUserId = localStorage.getItem("userId");
      const storedCoordinatorEmail = localStorage.getItem("coordinatorEmail");
      const storedStudentName = localStorage.getItem("studentName");
      const storedStudentId = localStorage.getItem("studentId");

      // Validate user type and required data
      if (!storedUserType || !storedUserId) {
        toast.error("Invalid session. Please login again.", { position: toast.POSITION.TOP_CENTER });
        handleLogout();
        return;
      }

      setUserType(storedUserType);
      setUserId(storedUserId);
      setCoordinatorEmail(storedCoordinatorEmail);
      setStudentId(storedStudentId);
      setStudentName(storedStudentName || "");
      fetchProjects();
    }
  }, [isLoggedIn, navigate]);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    let inactivityTimer;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        toast.warning("Session expired due to inactivity. Please login again.");
        handleLogout();
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, []);

  // Prevent going back to previous pages after logout
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!localStorage.getItem("token")) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        if (userType === "coordinator") {
          const res = await axios.get("http://localhost:8000/projects/unposted");
          if (res.data.success) {
            setProjects(res.data.projects);
          }
        } else {
          const res = await axios.get("http://localhost:8000/projects");
          if (res.data.success) {
            setProjects(res.data.projects);
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    loadInitial();
  }, [userType]);


  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies if they exist
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    setIsLoggedIn(false);
    navigate("/");
    
    // Force page reload to clear any remaining state
    window.location.reload();
  };

  const fetchProjects = async () => {
    try {
      const projectsResponse = userType === "coordinator"
        ? await axios.get("http://localhost:8000/projects/unposted")
        : await axios.get("http://localhost:8000/projects");
      const projectsData = projectsResponse.data;

      if (projectsData.success) {
        setProjects(projectsData.projects);
      } else {
        console.log("Error fetching projects");
      }
    } catch (error) {
      console.error(error);
      console.log("Error fetching projects");
    }
  };

  const approveProject = async (projectId) => {
    try {
      const res = await axios.post(`http://localhost:8000/projects/approve/${projectId}`);
      if (res.data && res.data.success) {
        toast.success("Project approved and posted");
        fetchProjects();
      } else {
        toast.error("Failed to approve project");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error approving project");
    }
  };

  const openProjectFile = (projectId, filename) => {
    fetch(`http://localhost:8000/projects/file/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const file = new Blob([blob], { type: "application/octet-stream" });
        const fileURL = URL.createObjectURL(file);

        const a = document.createElement("a");
        a.href = fileURL;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(fileURL);
      })
      .catch((error) => {
        console.error("Error downloading project file:", error);
      });
  };

  const handleDelete = async (projectId, projectFile) => {
    try {
      await axios.delete(`http://localhost:8000/projects/${projectId}`);
      setProjects(projects.filter((project) => project._id !== projectId));
    } catch (error) {
      console.error(error);
    }
  };

  
  
  const handleSelect = async (project) => {
    try {
      const response = await axios.post("http://localhost:8000/requests", {
        projectId: project._id,
        studentName,
        studentId,
        teacherName: project.teacherName,
        teacherId: project.teacherId,
        projectName: project.projectName,
      });

      if (response.data.success) {
        setProjects((prevProjects) =>
          prevProjects.map((prevProject) =>
            prevProject._id === project._id ? { ...prevProject, requestSent: true } : prevProject
          )
        );
        toast.success("Request sent successfully to the teacher.");
      } else {
        toast.error("Error sending request to the teacher.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while processing the request.");
    }
  };
  

  

  const handleCoordinate = (projectId) => {
    setShowEditRequestInput((prevState) => !prevState);
    setEditRequestMessage("");

    setOpenedProjectId(projectId);
  };

  const sendEditRequest = async (projectId) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/projects/edit-request/${projectId}`,
        {
          message: editRequestMessage,
        }
      );

      if (response.data.success) {
        toast.success("Edit project request sent successfully.");
        setEditRequestMessage("");
      } else {
        toast.error("Error sending edit project request.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending edit project request.");
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
              <small className="opacity-75">Available Projects</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {userType === "student" && (
              <div className="d-flex align-items-center me-3">
                <span className="badge bg-success me-2">{studentName}</span>
                <span className="online-dot"></span>
              </div>
            )}
            
            <div className="btn-group btn-group-sm">
              {userType === "teacher" && (
                <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/uploads")}>
                  Upload
                </button>
              )}
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/Teachers")}>
                Teachers
              </button>
              {userType === "coordinator" && (
                <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/ApprovedRequests")}>
                  Approved Requests
                </button>
              )}
              {userType === "student" && (
                <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/Notification")}>
                  Project Notification
                </button>
              )}
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
              <div className="card-header bg-success text-white text-center py-2">
                <h5 className="mb-0">
                  <i className="fas fa-project-diagram me-2"></i>
                  Available Projects ({projects.length})
                </h5>
              </div>
              
              <div className="card-body p-0">
                {projects.length === 0 ? (
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
                            <i className="fas fa-user-tie me-1 text-primary"></i>Teacher Name
                          </th>
                          <th className="border-0 px-3 py-2">
                            <i className="fas fa-project-diagram me-1 text-success"></i>Project Name
                          </th>
                          <th className="border-0 px-3 py-2 text-center">
                            <i className="fas fa-cogs me-1 text-warning"></i>Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoggedIn &&
                          projects.map((project) => (
                            <tr key={project._id} className="align-middle">
                              <td className="px-3 py-2">
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                       style={{width: '30px', height: '30px'}}>
                                    <i className="fas fa-user-tie fa-sm"></i>
                                  </div>
                                  <span className="fw-bold">{project.teacherName}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className="fw-bold text-dark">{project.projectName}</span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div className="btn-group btn-group-sm" role="group">
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => openProjectFile(project._id, project.projectFile)}
                                    title="View Project"
                                  >
                                    <i className="fas fa-eye fa-sm"></i> View
                                  </button>
                                  
                                  {isLoggedIn && userType === "student" && (
                                    <button
                                      className={`btn btn-sm ${project.requestSent ? "btn-secondary disabled" : "btn-success"}`}
                                      onClick={() => handleSelect(project)}
                                      disabled={project.requestSent}
                                      title={project.requestSent ? "Request Already Sent" : "Select Project"}
                                    >
                                      <i className={`fas fa-sm ${project.requestSent ? "fa-check" : "fa-hand-pointer"}`}></i>
                                      {project.requestSent ? "Request Sent" : "Select"}
                                    </button>
                                  )}
                                  
                                  {isLoggedIn && userType === "coordinator" && (
                                    <>
                                      <button
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => handleCoordinate(project._id)}
                                        title="Coordinate Project"
                                      >
                                        <i className="fas fa-edit fa-sm"></i> Coordinate
                                      </button>
                                      <button
                                        className="btn btn-success btn-sm ms-1"
                                        onClick={() => approveProject(project._id)}
                                        title="Approve and Post"
                                      >
                                        <i className="fas fa-check fa-sm"></i> Approve
                                      </button>
                                      
                                      {showEditRequestInput && openedProjectId === project._id && (
                                        <div className="mt-2 p-2 bg-light rounded">
                                          <input
                                            type="text"
                                            className="form-control form-control-sm mb-2"
                                            placeholder="Enter edit request message..."
                                            value={editRequestMessage}
                                            onChange={(e) => setEditRequestMessage(e.target.value)}
                                          />
                                          <div className="d-flex gap-1">
                                            <button
                                              className="btn btn-primary btn-sm"
                                              onClick={() => sendEditRequest(project._id)}
                                            >
                                              <i className="fas fa-paper-plane fa-sm"></i> Send
                                            </button>
                                            <button
                                              className="btn btn-outline-secondary btn-sm"
                                              onClick={() => setShowEditRequestInput(false)}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                      
                                      <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(project._id, project.projectFile)}
                                        title="Delete Project"
                                      >
                                        <i className="fas fa-trash fa-sm"></i> Delete
                                      </button>
                                    </>
                                  )}
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

export default Projects;
