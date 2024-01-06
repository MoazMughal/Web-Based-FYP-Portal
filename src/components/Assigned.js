import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css";
import logo from "../logo.jpg";
import { Modal, Button, } from "react-bootstrap";

function Assigned() {
  const navigate = useNavigate();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [archiveStatus, setArchiveStatus] = useState("");
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);


  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        const response = await axios.get("http://localhost:8000/assigned-projects");
        setAssignedProjects(response.data.projects);
      } catch (error) {
        console.error("Error fetching assigned projects:", error);
      }
    };

    fetchAssignedProjects();
  }, []);

  const handleAssign = async (projectId) => {
    try {
      const response = await axios.put(`http://localhost:8000/assigned-projects/${projectId}`, {
        status: "Assigned",
      });

      if (response.data.success) {
        setAssignedProjects((projects) =>
          projects.map((project) =>
            project._id === projectId ? { ...project, status: "Assigned" } : project
          )
        );
      }
    } catch (error) {
      console.error("Error assigning project:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Coologin");
  };

  const handleUnassign = async (projectId) => {
    try {
      const response = await axios.put(`http://localhost:8000/assigned-projects/${projectId}`, {
        status: "Unassigned",
      });

      if (response.data.success) {
        setAssignedProjects((projects) =>
          projects.map((project) =>
            project._id === projectId ? { ...project, status: "Unassigned" } : project
          )
        );
      }
    } catch (error) {
      console.error("Error unassigning project:", error);
    }
  };

  const handleAction = (projectId, projectStatus) => {
    if (projectStatus === "Unassigned") {
      handleAssign(projectId);
    } else {
      handleUnassign(projectId);
    }
  };

  const isUnassignDisabled = (studentName) => {
    const countAssigned = assignedProjects.filter(
      (project) => project.studentName === studentName && project.status === "Assigned"
    ).length;
    return countAssigned === 0; // If no projects are assigned, hide the 'Unassign' button
  };

  const handleProjectSelection = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const isArchiveButtonDisabled = () => {
    return selectedProjects.length === 0;
  };

  const handleArchive = async (projectId) => {
    setShowArchiveModal(true);
    setSelectedProjectId(projectId);
  };

  const handleCloseArchiveModal = () => {
    setShowArchiveModal(false);
    setSelectedSemester("");
    setSelectedProjectId(null);
  };
  const handleArchiveConfirmation = async () => {
    const currentYear = new Date().getFullYear();

    if (selectedSemester && selectedProjects.length > 0) {
      const invalidProjects = assignedProjects.filter(
        (project) =>
          selectedProjects.includes(project._id) &&
          new Date(project.assignmentDate).getFullYear() === currentYear
      );

      if (invalidProjects.length > 0) {
        toast.error("Cannot archive a project of the current year");
        setArchiveStatus("Cannot archive a project of the current year");
        return;
      }

      try {
        const archivePromises = selectedProjects.map(async (projectId) => {
          const projectToArchive = assignedProjects.find((project) => project._id === projectId);

          if (projectToArchive && projectToArchive.status !== "Unassigned") {
            const response = await axios.post(`http://localhost:8000/projects/archive/${projectId}`, {
              semester: selectedSemester,
              year: new Date(projectToArchive.assignmentDate).getFullYear(),
            });

            return response.data.success;
          }
          return false;
        });

        const results = await Promise.all(archivePromises);

        if (results.every((result) => result)) {
          setArchiveStatus("Projects archived successfully!");
          toast.success("Projects archived successfully!");
          setSelectedProjects([]); // Clear selected projects after archiving
          handleCloseArchiveModal();
        } else {
          setArchiveStatus("Failed to archive one or more projects.");
          toast.error("Failed to archive one or more projects.");
        }
      } catch (error) {
        console.error("Error archiving projects:", error);
        setArchiveStatus("Failed to archive one or more projects.");
        toast.error("Failed to archive one or more projects.");
      }
    }
  };




  return (
    <div className="assigned-container">
      <header className="header">
        <img src={logo} alt="QAU Logo" height="70" width="70" />
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
        <Link to="/ArchiveProjects" className="btn btn-primary">
          Archive Projects
        </Link>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <br />
      <br />
      <br />
      <br />
      <center>
        <h1>Assigned Projects</h1>
      </center>

      <table className="table">
        <thead>
          <tr>
            <th className="p-3 mb-2 bg-success text-white">Student Name</th>
            <th className="p-3 mb-2 bg-success text-white">Project Name</th>
            <th className="p-3 mb-2 bg-success text-white">Teacher Name</th>
            <th className="p-3 mb-2 bg-success text-white">Status</th>
            <th className="p-3 mb-2 bg-success text-white">Date</th>
            <th className="p-3 mb-2 bg-success text-white">Action</th>

          </tr>
        </thead>
        <tbody>
          {assignedProjects.map((project) => {
            return (project.status === "Assigned" &&
              <tr key={project._id}>
                <td>{project.studentName}</td>
                <td>{project.projectName}</td>
                <td>{project.teacherName}</td>
                <td>
                  <b style={{ color: project.status === "Assigned" ? "green" : "inherit" }}>
                    {project.status}
                  </b>
                </td>
                <td>
                  <b>{new Date(project.assignmentDate).toLocaleDateString()}</b>
                </td>
                <td>
                  {project.status === "Unassigned" ? (
                    <button className="btn btn-primary" onClick={() => handleAction(project._id, project.status)}>
                      Assign
                    </button>
                  ) : isUnassignDisabled(project.studentName) ? (
                    <span>No projects assigned</span>
                  ) : (
                    <button className="btn btn-danger" onClick={() => handleAction(project._id, project.status)}>
                      Unassign
                    </button>
                  )}
                </td>


                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleProjectSelection(project._id)}
                    checked={selectedProjects.includes(project._id)}
                    enabled={project.status === "Archived"}
                  />
                </td>

              </tr>

            );

          })}

          <tr>
    <td colSpan="6" style={{ textAlign: "center" }}>
      <Button
        variant="primary"
        onClick={() => setShowArchiveModal(true)}
        disabled={isArchiveButtonDisabled()}
      >
        Archive Selected Projects
      </Button>
    </td>
  </tr>
        </tbody>
      </table>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "right" }}>
      

        <Modal show={showArchiveModal} onHide={handleCloseArchiveModal}>
          <Modal.Header closeButton>
            <Modal.Title>Choose Semester and Year</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button onClick={() => setSelectedSemester("Fall")}>Fall</Button>
            <Button onClick={() => setSelectedSemester("Spring")}>Spring</Button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseArchiveModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleArchiveConfirmation}>
              Confirm Archive
            </Button>
          </Modal.Footer>
        </Modal>

        <div style={{ display: "flex", justifyContent: "flex-right" }}>
         


        </div>
      </div>
    </div>
  );
}

export default Assigned;
