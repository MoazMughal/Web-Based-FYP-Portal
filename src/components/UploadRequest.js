import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css";
import logo from "../logo.jpg";


function UploadRequest() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [projects, setProjects] = useState([]);
  const [coordinatorEmail, setCoordinatorEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [editRequestMessage, setEditRequestMessage] = useState("");
  const [showEditRequestInput, setShowEditRequestInput] = useState(false);
  const [openedProjectId, setOpenedProjectId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/projects/unposted")
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProjects(data.projects);
        } else {
          console.error("Error fetching projects:", data.message);
        }
      })
      .catch(error => {
        console.error("Error fetching projects:", error);
      });
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    } else {
      const storedUserType = localStorage.getItem("userType");
      const storedUserId = localStorage.getItem("userId");
      const storedCoordinatorEmail = localStorage.getItem("coordinatorEmail");

      setUserType(storedUserType);
      setUserId(storedUserId);
      setCoordinatorEmail(storedCoordinatorEmail);

      if (userType === "teacher" || userType === "coordinator") {
        fetchProjects();
      }
    }
  }, [isLoggedIn, navigate, userType]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:8000/projects/unposted");
      const data = response.data;

      if (data.success) {
        setProjects(data.projects);
      } else {
        console.error("Error fetching unposted projects");
      }
    } catch (error) {
      console.error(error);
      console.log("Error fetching unposted projects");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handlePost = async (projectId) => {
    try {
      const response = await axios.post(`http://localhost:8000/projects/approve/${projectId}`);
      if (response.data.success) {
        toast.success("Project posted successfully.");
        setProjects(prevProjects =>
          prevProjects.map(prevProject =>
            prevProject._id === projectId ? { ...prevProject, posted: true } : prevProject
          )
        );
      } else {
        toast.error("Error posting the project.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error posting the project.");
    }
  };

  const handleView = (projectId, projectFile) => {
    window.open(`http://localhost:8000/projects/file/${projectId}`);
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
        setProjects((prevProjects) =>
          prevProjects.map((prevProject) =>
            prevProject._id === projectId ? { ...prevProject, editRequest: true } : prevProject
          )
        );
      } else {
        toast.error("Error sending edit project request.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending edit project request.");
    }
  };


  const handleRemove = async (projectId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/projects/${projectId}`);
      if (response.data.success) {
        toast.success("Project removed successfully.");
        setProjects(prevProjects =>
          prevProjects.filter(prevProject => prevProject._id !== projectId)
        );
      } else {
        toast.error("Error removing the project.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error removing the project.");
    }
  };

  return (
    <div>
      <div className="header">
        <img
          src={logo}
          alt="QAU Logo"
          height="70"
          width="70"
        />
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
      
          
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <br />
      <br />
      <br />
      <br />
      <center>
        <h2>Teacher-Uploaded Projects</h2>
      </center>
      <table className="table">
        <thead>
          <tr>
            <th>Teacher Name</th>
            <th>Project Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        {/* ... (table header) */}
        <tbody>
          {isLoggedIn &&
            projects.map(project => (
              <tr key={project._id}>
                <td>{project.teacherName}</td>
                <td>{project.projectName}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleView(project._id, project.projectFile)}
                  >
                    View
                  </button>
                  {userType === "coordinator" && !project.posted && (
                    <button className="btn btn-success ml-2" onClick={() => handlePost(project._id)}>
                      Post
                    </button>
                  )}
                  {userType === "coordinator" && !project.posted && (
                    <button className="btn btn-warning ml-2" onClick={() => handleCoordinate(project._id)}>
                      Coordinate
                    </button>
                  )}
                  {showEditRequestInput && openedProjectId === project._id && (
                    <div className="mt-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter edit request message..."
                        value={editRequestMessage}
                        onChange={e => setEditRequestMessage(e.target.value)}
                      />
                      <button
                        className="btn btn-primary mt-2"
                        onClick={() => sendEditRequest(project._id)}
                      >
                        Send Edit Request
                      </button>
                    </div>
                  )}
                  {userType === "coordinator" && (
                    <button
                      className="btn btn-danger ml-2"
                      onClick={() => handleRemove(project._id)}
                    >
                      Remove
                    </button>
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

export default UploadRequest;
