import React, { useEffect, useState } from "react";
import "../css/style.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import logo from "../logo.jpg";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teachers, setTeachers] = useState([]);
  const userType = localStorage.getItem("userType"); // Change "token" to "userType"

  useEffect(() => {
    if (!userType) {
      navigate("/");
    } else {
      fetchTeachers();
    }
  }, [navigate, userType]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:9000/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const isCoordinator = userType.toLowerCase() === "coordinator"; // Use toLowerCase()

  const handleViewProjects = (teacherName) => {
    navigate("/fyp1", { state: { teacherName } });
  };

  const handleAddTeachers = () => {
    navigate("/AddTeach"); // Navigate to the Add Teachers page
  };

  const handleAssignedProjects = () => {
    navigate("/assigned"); // Route to the assigned projects page
  };

  const handleUploadRequests = () => {
    navigate("/uploadRequest"); // Route to the upload requests page
  };

  return (
    <div className="homepage">
      <header className="header">
        <img
          src={logo}
          alt="QAU Logo"
          height="70"
          width="70"
        />
        <h3>Welcome to FYP Portal</h3>
        <div className="header-buttons">
          {isCoordinator && (
            <button className="btn btn-primary" onClick={handleAddTeachers}>
              Add Teachers
            </button>
          )}
          <Link to="/projects" className="btn btn-primary ml-2">
            Projects
          </Link>
          <button className="btn btn-primary" onClick={handleAssignedProjects}>
            Assigned Projects
          </button>
          {"\u00A0"}
          {isCoordinator && (
            <Link to="/uploadRequest" className="btn btn-primary ml-2">
              Upload Requests
            </Link>
          )}
          {isCoordinator && (
            <Link to="/ArchiveProjects" className="btn btn-primary ml-2">
              Archive Projects
            </Link>
          )}
          {"\u00A0"}
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <br />
      <br />
      <div className="container"><br />
        <h1 className="text-center mt-5">Teachers Projects</h1>
        <hr /> 
        <div className="row mt-5">
          {teachers.map((teacher) => (
            <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={teacher._id}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{teacher.name}</h5>
                  <p className="card-text">{teacher.project}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewProjects(teacher.name)}
                  >
                    View Projects
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default Home;
