import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import logo from "../logo.jpg";

function EditRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const teacherId = localStorage.getItem("userId");
    const [project, setProjects] = useState([]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("teacherId");
        navigate("/teacherlogin");
    };

    useEffect(() => {
        const fetchEditRequests = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/edit-requests/${teacherId}`);
                if (response.data.success) {
                    setRequests(response.data.editRequests); // Update with "editRequests" instead of "requests"
                } else {
                    console.log("Error fetching edit requests");
                }
            } catch (error) {
                console.error(error);
                console.log("Error fetching edit requests");
            }
        };

        fetchEditRequests();
    }, [teacherId]);

    const handleDelete = async (requestId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/edit-requests/${requestId}`);
            if (response.data.success) {
                setRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));
            } else {
                console.log("Error deleting request");
            }
        } catch (error) {
            console.error(error);
            console.log("Error deleting request");
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
console.log(requests);

    return (
        <div>
            <div className="header">
                <img
                    src={logo}
                    alt="QAU Logo"
                    height="70"
                    width="70"
                />
                <h3>Welcome to Web-FYP Portal</h3>
                <div className="header-info">
                    {teacherId && <span>Teacher ID: {teacherId}</span>}
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
            <br /><br /><br />
            <h2>Edit Requests</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Project Name</th>
                        <th>Project File</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => (
                        <tr key={request._id}>
                            <td>{request.projectName}</td>
                            <td>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => openProjectFile(request.projectId, request.projectFile)}
                                >
                                    View
                                </button>
                            </td>

                            <td>{request.message}</td>
                            <td>{request.status}</td>
                            <td>

                                <a
                                    onClick={() => {
                                        const projectToEdit = requests.find((req) => req._id === request._id); // Find the corresponding project
                                        if (projectToEdit) {
                                            navigate("/uploads", { state: { projectToEdit } }); // Pass the projectToEdit data to the /uploads page
                                        } else {
                                            console.log("Project to edit not found");
                                        }
                                    }}
                                    className="btn btn-primary"
                                >
                                    Edit
                                </a>


                            </td>
                            <td>
                                <button
                                    onClick={() => handleDelete(request._id)}
                                    className="btn btn-danger"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <footer className="footer mt-auto py-3">
                <div className="container text-center">
                    <span className="text-muted">&copy; 2023 FYP-Portal. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
}

export default EditRequests;
