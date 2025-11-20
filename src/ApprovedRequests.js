import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";

function ApprovedRequest() {
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
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-gradient-success text-white text-center py-3 rounded-top-4">
              <h4 className="mb-0 fw-bold">
                <i className="fas fa-check-circle me-2"></i>
                Approved Project Requests
              </h4>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Student Name</th>
                      <th>Project Name</th>
                      <th>Teacher Name</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedProjects?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">No approved requests yet</td>
                      </tr>
                    ) : (
                      approvedProjects.map((project) => (
                        <tr key={project._id}>
                          <td>{project.studentName}</td>
                          <td>{project.projectName}</td>
                          <td>{project.teacherName ? project.teacherName : "Not Assigned"}</td>
                          <td><span className="badge bg-success-subtle text-success">{project.status}</span></td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm" role="group">
                              <button className="btn btn-success" onClick={() => assignProject(project._id)}>
                                <i className="fas fa-user-check me-1"></i>
                                Assign
                              </button>
                              <button className="btn btn-outline-danger" onClick={() => removeProject(project._id)}>
                                <i className="fas fa-times me-1"></i>
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ApprovedRequest;