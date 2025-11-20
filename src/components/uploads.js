import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../logo.jpg";
import "../css/style.css";

function Uploads() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state;
  

  const [projectName, setProjectName] = useState("");
  const [projectDomain, setProjectDomain] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectFile, setProjectFile] = useState(null);
  const [teacherId, setTeacherId] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const storedTeacherName = localStorage.getItem("username");
  const teacherName = storedTeacherName ? storedTeacherName : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    
    if (!token || userType !== "teacher") {
      toast.error("Access denied. Please login as teacher.", { position: toast.POSITION.TOP_CENTER });
      localStorage.clear();
      navigate("/teacherlogin");
      return;
    }
    
    const storedTeacherId = localStorage.getItem("userId");
    setTeacherId(storedTeacherId);
  }, [navigate]);

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
    if (locationState && locationState.projectToEdit) {
      const { projectToEdit } = locationState;
      setProjectToEdit(projectToEdit);
      setProjectName(projectToEdit.projectName);
      setProjectDomain(projectToEdit.projectDomain);
      setProjectDescription(projectToEdit.projectDescription);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [locationState]);

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies if they exist
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Navigate to login page
    navigate("/teacherlogin");
    
    // Force page reload to clear any remaining state
    window.location.reload();
  };

  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
    if (errors.projectName) {
      setErrors(prev => ({ ...prev, projectName: "" }));
    }
  };

  const handleProjectDomainChange = (e) => {
    setProjectDomain(e.target.value);
    if (errors.projectDomain) {
      setErrors(prev => ({ ...prev, projectDomain: "" }));
    }
  };

  const handleProjectDescriptionChange = (e) => {
    setProjectDescription(e.target.value);
    if (errors.projectDescription) {
      setErrors(prev => ({ ...prev, projectDescription: "" }));
    }
  };

  const handleProjectFileChange = (e) => {
    setProjectFile(e.target.files[0]);
    if (errors.projectFile) {
      setErrors(prev => ({ ...prev, projectFile: "" }));
    }
  };

  const uploadProject = async (formData) => {
    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:8000/projects", formData);
      const token = localStorage.getItem("token");
  
      if (!token) {
        navigate("/teacherlogin");
        return;
      }
  
      if (response.data.success) {
        console.log("Project uploaded successfully");
  
        setProjectName("");
        setProjectDomain("");
        setProjectDescription("");
        setProjectFile(null);
        setUploadSuccess(true);
        setIsPosted(false);
  
        toast.success("Project uploaded successfully!", {
          autoClose: 3000,
        });
  
        navigate("/uploads", { state: { teacherId } });
      } else {
        console.log("Error uploading project");
        toast.error("Error uploading project. Please try again later.", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error uploading project. Please try again later.", {
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    const newErrors = {};
    
    // Validation
    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }
    
    if (!projectDomain.trim()) {
      newErrors.projectDomain = "Project domain is required";
    }
    
    if (!projectDescription.trim()) {
      newErrors.projectDescription = "Project description is required";
    }
    
    if (!projectFile && !isEditing) {
      newErrors.projectFile = "Project file is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("teacherId", teacherId);
    formData.append("teacherName", teacherName);
    formData.append("projectName", projectName);
    formData.append("projectDomain", projectDomain);
    formData.append("projectDescription", projectDescription);
    if (projectFile) {
      formData.append("projectFile", projectFile);
    }

    if (projectToEdit) {
      await updateProject(formData, projectToEdit._id);
    } else {
      await uploadProject(formData);
    }
  };

  const updateProject = async (formData, projectId) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`http://localhost:8000/projects/${projectId}`, formData);
  
      if (response.status === 200) {
        console.log("Project updated successfully");
        toast.success("Project updated successfully!", { autoClose: 3000 });
  
        setProjectName("");
        setProjectDomain("");
        setProjectDescription("");
        setProjectFile(null);
        setUploadSuccess(true);
        setProjectToEdit(null);
        setIsEditing(false);
      } else {
        console.log("Error updating project - Status:", response.status);
        console.error("Error updating project - Response:", response.data);
        toast.error("Error updating project. Please try again later.", { autoClose: 3000 });
      }
    } catch (error) {
      console.error("Caught an error while updating the project:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      toast.error("Error updating project. Please try again later.", { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setProjectName("");
    setProjectDomain("");
    setProjectDescription("");
    setProjectFile(null);
    setProjectToEdit(null);
    setIsEditing(false);
    setErrors({});
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
              <small className="opacity-75">Project Upload System</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {teacherId && <span className="badge bg-primary">{teacherName}</span>}
            <div className="btn-group btn-group-sm">
              <a href="/fyp1" className="btn btn-outline-light btn-sm">My Projects</a>
              <a href="/projects" className="btn btn-outline-light btn-sm">Projects</a>
              <a href="/requests" className="btn btn-outline-light btn-sm">Requests</a>
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/edit-requests")}>
                Edit Requests
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Form */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white text-center py-2">
                <h5 className="mb-0">
                  <i className="fas fa-upload me-2"></i>
                  {projectToEdit ? "Edit Project" : "Upload New Project"}
                </h5>
              </div>
              
              <div className="card-body p-3">
                <form onSubmit={handleFormSubmit} encType="multipart/form-data">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label htmlFor="projectName" className="form-label fw-bold small mb-1">
                        <i className="fas fa-project-diagram me-1 text-primary"></i>Project Name
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-sm ${errors.projectName ? 'is-invalid' : ''}`}
                        id="projectName"
                        name="projectName"
                        value={projectName}
                        onChange={handleProjectNameChange}
                        placeholder="Enter project name"
                      />
                      {errors.projectName && <div className="invalid-feedback small">{errors.projectName}</div>}
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="projectDomain" className="form-label fw-bold small mb-1">
                        <i className="fas fa-tags me-1 text-success"></i>Project Domain
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-sm ${errors.projectDomain ? 'is-invalid' : ''}`}
                        id="projectDomain"
                        name="projectDomain"
                        value={projectDomain}
                        onChange={handleProjectDomainChange}
                        placeholder="e.g., Web Development, AI, etc."
                      />
                      {errors.projectDomain && <div className="invalid-feedback small">{errors.projectDomain}</div>}
                    </div>
                  </div>

                  <div className="mt-2">
                    <label htmlFor="projectDescription" className="form-label fw-bold small mb-1">
                      <i className="fas fa-align-left me-1 text-info"></i>Project Description
                    </label>
                    <textarea
                      className={`form-control form-control-sm ${errors.projectDescription ? 'is-invalid' : ''}`}
                      id="projectDescription"
                      name="projectDescription"
                      rows="2"
                      value={projectDescription}
                      onChange={handleProjectDescriptionChange}
                      placeholder="Brief description of the project..."
                    ></textarea>
                    {errors.projectDescription && <div className="invalid-feedback small">{errors.projectDescription}</div>}
                  </div>

                  <div className="mt-2">
                    <label htmlFor="projectFile" className="form-label fw-bold small mb-1">
                      <i className="fas fa-file-upload me-1 text-warning"></i>Project File
                    </label>
                    <input
                      type="file"
                      className={`form-control form-control-sm ${errors.projectFile ? 'is-invalid' : ''}`}
                      id="projectFile"
                      name="projectFile"
                      onChange={handleProjectFileChange}
                    />
                    {errors.projectFile && <div className="invalid-feedback small">{errors.projectFile}</div>}
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Supported formats: PDF, DOC, DOCX, TXT
                    </small>
                  </div>

                  <div className="d-grid gap-2 mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-sm fw-bold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {isEditing ? "Updating..." : "Uploading..."}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${isEditing ? 'fa-edit' : 'fa-upload'} me-2`}></i>
                          {isEditing ? "Update Project" : "Upload Project"}
                        </>
                      )}
                    </button>
                    
                    {isEditing && (
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={resetForm}
                      >
                        <i className="fas fa-times me-2"></i>Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default Uploads;