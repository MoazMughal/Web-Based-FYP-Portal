import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css";
import logo from "../logo.jpg";

function ProjectRequest() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [projects, setProjects] = useState([]);
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [approvedProject, setApprovedProject] = useState(null);
  const [newRequestsCount, setNewRequestsCount] = useState(0);

  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    } else {
      const storedUserType = localStorage.getItem("userType");
      const storedUserId = localStorage.getItem("userId");

      setUserType(storedUserType);
      setUserId(storedUserId);

      if (userType === "teacher") {
        fetchTeacherProjects();
        // Get and set the teacher's name
        const storedTeacherName = localStorage.getItem("username");
        setTeacherName(storedTeacherName ? storedTeacherName : "");
      }
    }
  }, [isLoggedIn, navigate, userType]);

  const fetchTeacherProjects = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/requests/${userId}`);
      const data = response.data;

      if (data.success) {
        // Filter out projects that are Disapproved
        const filteredProjects = data.requests.filter((project) => project.status !== 'Disapproved');
        setProjects(filteredProjects);

        // Count the number of new pending requests
        const newRequests = filteredProjects.filter((project) => project.status === 'Pending');
        setNewRequestsCount(newRequests.length);

        handleSuccessfulApproval(); // Call this function here after setting the projects
      } else {
        console.error("Error fetching teacher's projects");
      }
    } catch (error) {
      console.error("Error fetching teacher's projects:", error);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleApprove = async (projectId) => {
    try {
      const response = await axios.post(`http://localhost:8000/requests/approve/${projectId}`);
      if (response.data.success) {
        toast.success('Project approved successfully');
        // Only after success response, update the projects list
        fetchTeacherProjects();
      } else {
        toast.error('Error approving the project.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error approving the project.');
    }
  };

  const handleSuccessfulApproval = (projectId, action) => {
    let successMessage = '';

    if (action === 'approve') {
      successMessage = 'Project approved successfully';
    } else if (action === 'disapprove') {
      successMessage = 'Project disapproved successfully';
    }

    if (successMessage) {
      toast.success(successMessage);

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === projectId
            ? { ...project, status: action === 'approve' ? 'Approved' : 'Disapproved' }
            : project
        )
      );

      // Only update approvedProjects in localStorage if action is 'approve'
      if (action === 'approve') {
        const storedApprovedProjects = localStorage.getItem('approvedProjects');
        let approvedProjects = storedApprovedProjects ? JSON.parse(storedApprovedProjects) : [];
        const newlyApprovedProject = projects.find((project) => project._id === projectId);
        if (newlyApprovedProject) {
          approvedProjects.push(newlyApprovedProject);
          localStorage.setItem('approvedProjects', JSON.stringify(approvedProjects));
        } else {
          console.error('Error finding the approved project');
        }
      }
    }
  };




  const handleDisapprove = async (projectId) => {
    try {
      const response = await axios.post(`http://localhost:8000/requests/disapprove/${projectId}`);
      if (response.data.success) {
        toast.success('Project disapproved successfully');
        // Only after success response, update the projects list
        fetchTeacherProjects();
      } else {
        toast.error('Error disapproving the project.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error disapproving the project.');
    }
  };



  return (
    <div>
      <div className="header">
        <img src={logo} alt="QAU Logo" height="70" width="70" />
        <h3>Welcome to Web-FYP Portal</h3>
       
        <div className="header-buttons">
          <a href="/fyp1" className="btn btn-primary">
            My Projects
          </a>{" "}
          <a href="/projects" className="btn btn-primary">
            Projects
          </a>{" "}
          <a href="/requests" className="btn btn-primary">
            Requests {newRequestsCount > 0 && <span className="badge badge-danger ml-1">{newRequestsCount}</span>}
          </a>{" "}
          <button className="btn btn-primary" onClick={() => navigate("/edit-requests")}>
            Edit Requests
          </button>
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
        <h2>Project Requests</h2>
      </center>
      <table className="table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Project Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoggedIn &&
            projects.map((project) => (
              <tr key={project._id}>
                <td>{project.studentName}</td>
                <td>{project.projectName}</td>
                <td>
                  {project.status === "Pending" && (
                    <div>
                      <button
                        className="btn btn-success mr-2"
                        onClick={() => handleApprove(project._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDisapprove(project._id)}
                      >
                        Disapprove
                      </button>
                    </div>
                  )}
                  {project.status === "Approved" && (
                    <button className="btn btn-secondary" disabled>
                      Approved
                    </button>
                  )}
                  {project.status === "Disapproved" && (
                    <button className="btn btn-warning" disabled>
                      Disapproved
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

export default ProjectRequest;