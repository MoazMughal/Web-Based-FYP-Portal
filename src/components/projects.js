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

      setUserType(storedUserType);
      setUserId(storedUserId);
      setCoordinatorEmail(storedCoordinatorEmail);
      setStudentId(storedStudentId);
      setStudentName(storedStudentName || "");
      fetchProjects();
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetch("http://localhost:8000/projects?posted=true")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setProjects(data.projects);
        } else {
          console.error("Error fetching projects:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const fetchProjects = async () => {
    try {
      const projectsResponse = await axios.get("http://localhost:8000/projects");
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
    <div style={{ backgroundColor: "#f7f7f7", minHeight: "100vh", padding: "20px" }}>
    <div className="header" style={{ backgroundColor: "#343a40", color: "#fff", padding: "20px" }}>
      <img src={logo} alt="QAU Logo" height="70" width="70" />
      <h3 style={{ margin: 0, marginLeft: "20px" }}>Welcome to FYP Portal</h3>
        {userType === "student" && (
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>
  {studentName} <span className="online-dot"></span>
</div>

        )}
        
        <div className="header-buttons">
          {userType === "teacher" && (
            <button
              className="btn btn-primary mr-2"
              onClick={() => navigate("/uploads")}
            >
              Upload
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate("/Teachers")}>
            Teachers
          </button>
          {userType === "coordinator" && (
        <div className="header-buttons">
          {/* Existing buttons */}
          <button className="btn btn-primary" onClick={() => navigate("/ApprovedRequests")}>
            Approved Requests
          </button>
        </div>
      )}
          {userType === "student" && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/Notification")}
            >
              Project Notification
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <center>
        <h2>Available Projects</h2>
      </center>
      <table className="table" style={{ backgroundColor: "#dbe4eb", borderRadius: "5px", overflow: "hidden" }}>
        <thead style={{ background: "#007bff", color: "#fff" }}>
        <tr>
      <th class="p-3 mb-2 bg-success text-white">Teacher Name</th>
      <th class="p-3 mb-2 bg-success text-white">Project Name</th>
      <th class="p-3 mb-2 bg-success text-white">Actions</th>
    </tr>
        </thead>
        <tbody>
          {isLoggedIn &&
            projects.map((project) => (
              <tr key={project._id}>
                <td>{project.teacherName}</td>
                <td>{project.projectName}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => openProjectFile(project._id, project.projectFile)}
                  >
                    View
                  </button>
                  {isLoggedIn && userType === "student" && (
                    <button
                      className={`btn btn-success ml-2 ${project.requestSent ? "disabled" : ""
                        }`}
                      onClick={() => handleSelect(project)}
                      disabled={project.requestSent}
                    >
                      {project.requestSent ? "Request Sent" : "Select"}
                    </button>
                  )}
                  {isLoggedIn && userType === "coordinator" && (
                    <div>
                      <button
                        className="btn btn-warning ml-2"
                        onClick={() => handleCoordinate(project._id)}
                      >
                        Coordinate
                      </button>
                      {showEditRequestInput &&
                        openedProjectId === project._id && (
                          <div className="mt-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter edit request message..."
                              value={editRequestMessage}
                              onChange={(e) => setEditRequestMessage(e.target.value)}
                            />
                            <button
                              className="btn btn-primary mt-2"
                              onClick={() => sendEditRequest(project._id)}
                            >
                              Send Edit Request
                            </button>
                          </div>
                        )}
                      <button
                        className="btn btn-danger ml-2"
                        onClick={() => handleDelete(project._id, project.projectFile)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      
      <ToastContainer />
    </div>
  );
}

export default Projects;
