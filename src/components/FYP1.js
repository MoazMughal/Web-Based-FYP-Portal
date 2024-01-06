import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Importing ToastContainer and toast separately
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import "../css/style.css";
import logo from "../logo.jpg";

function FYP1() {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState("");
  const [projects, setProjects] = useState([]);
  const location = useLocation();
  const userType = localStorage.getItem("userType");
  const [studentId, setStudentId] = useState(localStorage.getItem("studentId") || "");
  const [studentName, setStudentName] = useState(localStorage.getItem("studentName") || "");
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedTeacherId = localStorage.getItem("userId");

    if (!token) {
      navigate("/teacherlogin");
    } else {
      setTeacherId(storedTeacherId);
      if (userType !== "student") {
        fetchProjects(storedTeacherId);
      }
    }
  }, [navigate, userType]);

  useEffect(() => {
    if (location.state && location.state.teacherName) {
      fetchProjectsbyName(location.state.teacherName);
    }
  }, [location.state]);

  const fetchProjects = async (teacherId) => {
    try {
      const response = await axios.get(`http://localhost:8000/projects/${teacherId}`);
      if (response.data.success) {
        setProjects(response.data.projects);
      } else {
        console.log("Error fetching projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchProjectsbyName = async (teacherName) => {
    try {
      const response = await axios.get(`http://localhost:8000/projects/name/${teacherName}`);
      if (response.data.success) {
        setProjects(response.data.projects);
      } else {
        console.log("Error fetching projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
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
        console.error('Error downloading project file:', error);
      });
  };

  
  const handleSelect = async (project) => {
    try {
      // Check if the project is unassigned or has status "Unassigned"
      if (project.status === "Unassigned") {
        // Proceed to request the unassigned project
        const response = await axios.post("http://localhost:8000/requests", {
          projectId: project._id,
          studentName,
          studentId,
          teacherName: project.teacherName,
          teacherId: project.teacherId,
          projectName: project.projectName,
        });
  
        if (response.data.success) {
          // Update UI to reflect the request sent
          setProjects((prevProjects) =>
            prevProjects.map((prevProject) =>
              prevProject._id === project._id ? { ...prevProject, requestSent: true } : prevProject
            )
          );
  
          toast.success("Request sent successfully to the teacher.");
        } else {
          toast.error("Error sending request to the teacher.");
        }
      } else {
        // Check if the project has already been assigned to the student
        const isAssigned = await axios.get(`http://localhost:8000/assigned/${project._id}`);
        if (isAssigned.data.success && isAssigned.data.projects.length > 0) {
          const assignedProject = isAssigned.data.projects[0];
          if (assignedProject.studentId === studentId) {
            toast.error("You have already been assigned this project.");
            return;
          }
        }
  
        // Check if the student has any project already assigned or archived
        const studentAssignedProjects = await axios.get(`http://localhost:8000/assigned-projects`);
        const studentAssignedProjectsArchive = await axios.get(`http://localhost:8000/archive-projects`);
  
        if (
          studentAssignedProjects.data.success &&
          studentAssignedProjects.data.projects.length > 0 &&
          studentAssignedProjectsArchive.data.success &&
          studentAssignedProjectsArchive.data.projects.length > 0
        ) {
          const assignedProjects = studentAssignedProjects.data.projects;
          const assignedProjectsArchive = studentAssignedProjectsArchive.data.projects;
  
          const hasAssignedProject = assignedProjects.some(
            (assignedProject) => assignedProject.studentId === studentId && assignedProject.status === "Assigned"
          );
  
          const hasAssignedProjectArchive = assignedProjectsArchive.some(
            (assignedProject) => assignedProject.studentId === studentId && assignedProject.status === "Archived"
          );
  
          if (hasAssignedProject || hasAssignedProjectArchive) {
            toast.error("You have previously been assigned or archived a project.");
            return;
          }
        }
  
        // Proceed to request the project if it's not already assigned or archived
        const response = await axios.post("http://localhost:8000/requests", {
          projectId: project._id,
          studentName,
          studentId,
          teacherName: project.teacherName,
          teacherId: project.teacherId,
          projectName: project.projectName,
        });
  
        if (response.data.success) {
          // Update UI to reflect the request sent
          setProjects((prevProjects) =>
            prevProjects.map((prevProject) =>
              prevProject._id === project._id ? { ...prevProject, requestSent: true } : prevProject
            )
          );
  
          toast.success("Request sent successfully to the teacher.");
        } else {
          toast.error("Error sending request to the teacher.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while processing the request.");
    }
  };

  const handleDelete = async (projectId, projectFile) => {
    try {
      await axios.delete(`http://localhost:8000/projects/${projectId}`);
      setProjects(projects.filter((project) => project._id !== projectId));
      fetchProjects(teacherId);
      toast.success("Project deleted successfully.");
    } catch (error) {
      console.error("Error deleting the project:", error);
      toast.error("Error deleting the project.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/teacherlogin");
  };

  return (
    <div style={{ backgroundColor: "#f7f7f7", minHeight: "100vh", padding: "20px" }}>
      <header className="header">
        <img
          src={logo}
          alt="QAU Logo"
          height="70"
          width="70"
        />
        <h3 style={{ margin: 0, marginLeft: "20px" }}>Welcome to FYP Portal</h3>
        <div className="header-buttons">
          {userType === "student" ? (
            <>
              <Link to="/projects" className="btn btn-primary">
                Projects
              </Link>
              <Link to="/project-notification" className="btn btn-primary">
                Project Notification
              </Link>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
              {/* Add other buttons specifically for students if needed */}
            </>
          ) : (
            <>
              <Link to="/uploads" className="btn btn-primary">
                Upload Project
              </Link>
              <Link to="/fyp1" className="btn btn-primary">
                My Projects
              </Link>
              <Link to="/projects" className="btn btn-primary">
                Projects
              </Link>
              <Link to="/requests" className="btn btn-primary">
                Requests
              </Link>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </header>
      <br /><br /><br /><br />
      <div className="content-container">
        <center><h2>Available Projects</h2></center>
        <table className="table table-striped" style={{ backgroundColor: "#fff" }}>
          <thead style={{ background: "#343a40", color: "#fff" }}>
            <tr>
              <th class="p-3 mb-2 bg-success text-white">Teacher Name</th>
              <th class="p-3 mb-2 bg-success text-white">Project Name</th>
              <th class="p-3 mb-2 bg-success text-white">Project Domain</th>
              <th class="p-3 mb-2 bg-success text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project._id}>
                <td>{project.teacherName}</td>
                <td>{project.projectName}</td>
                <td>{project.projectDomain}</td>
                <td>
                  {userType === "student" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSelect(project)}
                      disabled={project.requestSent}
                    >
                      {project.requestSent ? "Request Sent" : "Select"}
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={() => openProjectFile(project._id, project.projectFile)}
                  >
                    View
                  </button>
                  {userType === "teacher" && project.teacherId === teacherId && (
                    <>
                      <Link
                        to={{
                          pathname: "/uploads",
                          state: { teacherId, projectToEdit: project },
                        }}
                        className="btn btn-primary"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger ml-2"
                        onClick={() => handleDelete(project._id, project.projectFile)}
                      >
                        Delete
                      </button>
                    </>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ToastContainer />
      </div>


    </div>
  );
}

export default FYP1;
