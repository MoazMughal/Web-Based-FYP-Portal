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


  const storedTeacherName = localStorage.getItem("username");
  const teacherName = storedTeacherName ? storedTeacherName : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/teacherlogin");
    } else {
      const storedTeacherId = localStorage.getItem("userId");
      setTeacherId(storedTeacherId);
    }
  }, [navigate]);

  useEffect(() => {
    if (projectToEdit) {
      setProjectName(projectToEdit.projectName || "");
      setProjectDomain(projectToEdit.projectDomain || "");
      setProjectDescription(projectToEdit.projectDescription || "");
      // No need to set projectFile here; the file field should not retain its value
    }
  }, [projectToEdit]);


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
    localStorage.removeItem("token");
    localStorage.removeItem("teacherId");
    navigate("/teacherlogin");
  };

  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
  };

  const handleProjectDomainChange = (e) => {
    setProjectDomain(e.target.value);
  };

  const handleProjectDescriptionChange = (e) => {
    setProjectDescription(e.target.value);
  };

  const handleProjectFileChange = (e) => {
    setProjectFile(e.target.files[0]);
  };

  const uploadProject = async (formData) => {
    try {
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
        setIsPosted(false); // Set isPosted to false when uploading a new project
  
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
    }
  };
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    const newErrors = {};
    // Validation code here...

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
    formData.append("projectFile", projectFile);

    if (projectToEdit) {
      await updateProject(formData, projectToEdit._id);
    } else {
      await uploadProject(formData);
    }
  };

  const updateProject = async (formData, projectId) => {
    try {
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
      } else {
        console.log("Error updating project - Status:", response.status);
        console.error("Error updating project - Response:", response.data);
        toast.error("Error updating project. Please try again later.", { autoClose: 3000 });
      }
    } catch (error) {
      console.error("Caught an error while updating the project:", error);
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      toast.error("Error updating project. Please try again later.", { autoClose: 3000 });
    }
  };


  return (
    <div>
    <div className="sidebar">
  <h1 className="text-lg font-bold my-5 text-center">Final Year Project Portal</h1>
  <p className="my-1 text-center">Department of Computer Science</p>
  <p className="my-1 text-center">Quaid Azam University Islamabad</p>

  <div className="contact-details text-center mt-4">
    <p className="mb-2">Contact Us:</p>
    <p className="mb-1">Email: info@fypportal.com</p>
    <p className="mb-1">Phone: +1234567890</p>
  </div>
</div>
      <div className="header">
        <img src={logo} alt="QAU Logo" height="70" width="70" />
        <h3>Welcome to FYP Portal</h3>

        <div className="header-info">
          {teacherId && <span>{teacherName}</span>}
        </div>

        <div>
          <div className="header-buttons">
            <a href="/fyp1" className="btn btn-primary">
              My Projects
            </a>{" "}
            <a href="/projects" className="btn btn-primary">
              Projects
            </a>{" "}
            <a href="/requests" className="btn btn-primary">
              Requests
            </a>{" "}

            <button className="btn btn-primary" onClick={() => navigate("/edit-requests")}>
              Edit Requests
            </button>

            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <br />
      <center>
        <h2>Upload Project</h2>
      </center>
      {teacherName && <span>{teacherName}</span>}
      <center>
        <h2>{projectToEdit ? "Edit Project" : "Upload Project"}</h2>
      </center>
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <form
              onSubmit={handleFormSubmit}
              encType="multipart/form-data"
              className="form-group" // Add a class to the form for styling
            >
              <div className="form-group1">
                <b>
                  <br />
                  <label htmlFor="projectName">Project Name</label>
                </b>
                <input
                  type="text"
                  className="form-control"
                  id="projectName"
                  name="projectName"
                  value={projectToEdit ? projectToEdit.projectName : projectName}
                  onChange={handleProjectNameChange}
                />
                {errors.projectName && <div className="error">{errors.projectName}</div>}
              </div>

              <div className="form-group1">
                <b>
                  <label htmlFor="projectDomain">Project Domain</label>
                </b>
                <input
                  type="text"
                  className="form-control"
                  id="projectDomain"
                  name="projectDomain"
                  value={projectDomain}
                  onChange={handleProjectDomainChange}
                />
                {errors.projectTitle && <div className="error">{errors.projectTitle}</div>}
              </div>

              <div className="form-group1">
                <b>
                  <label htmlFor="projectDescription">Project Description</label>
                </b>
                <textarea
                  className="form-control"
                  id="projectDescription"
                  name="projectDescription"
                  rows="3"
                  value={projectDescription}
                  onChange={handleProjectDescriptionChange}
                ></textarea>
                {errors.projectDescription && (
                  <div className="error">{errors.projectDescription}</div>
                )}
                <br />
              </div>

              <div className="form-group1">
                <b>
                  <label htmlFor="projectFile">Project File</label>
                </b>
                <div className="custom-file">
                  <input
                    type="file"
                    className="custom-file-input"
                    id="projectFile"
                    name="projectFile"
                    onChange={handleProjectFileChange}
                  />
                </div>
                {errors.projectFile && <div className="error">{errors.projectFile}</div>}
              </div>

            
              <div className="col-md-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '3px' }}>
  {/* Button */}
  <div className="form-group1">
    <button type="submit" className="btn btn-primary">
      {isEditing ? "Update" : "Upload"}
    </button>
  </div>
</div>
            </form>
          </div>
        </div>
      </div>
      <footer className="footer">
            &copy; Copyright 2023 FYP Portal
          </footer>
      <ToastContainer />
    </div>
  );
}

export default Uploads;