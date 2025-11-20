import React, { useEffect, useState } from "react";
import "../css/style.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import logo from "../logo.jpg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Check for valid session
    const token = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");
    const storedUserId = localStorage.getItem("userId");

    if (!token || !storedUserType || !storedUserId) {
      // Clear any remaining session data
      localStorage.clear();
      navigate("/");
      return;
    }

    // Set user info
    setUserType(storedUserType);
    setUserId(storedUserId);

    // Check token validity with backend
    checkTokenValidity(token);
  }, [navigate]);

  const checkTokenValidity = async (token) => {
    try {
      // You can add a token validation endpoint in your backend
      // For now, we'll just check if the token exists and has proper format
      if (token && token.length > 10) {
        fetchTeachers();
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies if they exist
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Navigate to login page
    navigate("/");
    
    // Force page reload to clear any remaining state
    window.location.reload();
  };

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

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8000/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isCoordinator = userType?.toLowerCase() === "coordinator";

  const handleViewProjects = (teacherName) => {
    navigate("/fyp1", { state: { teacherName } });
  };

  const handleAddTeachers = () => {
    navigate("/AddTeach");
  };

  const handleAssignedProjects = () => {
    navigate("/assigned");
  };

  const handleUploadRequests = () => {
    navigate("/uploadRequest");
  };

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

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-0">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <img 
                  src={logo} 
                  alt="QAU Logo" 
                  height="60" 
                  width="60" 
                  className="me-3 rounded-circle shadow"
                />
                <h4 className="mb-0 text-primary fw-bold">FYP Portal</h4>
              </div>
            </div>
            <div className="col-md-6 text-center">
              <h3 className="mb-0 text-dark fw-bold">Welcome to Final Year Project Portal</h3>
              <p className="mb-0 text-muted small">Department of Computer Science, QAU Islamabad</p>
            </div>
            <div className="col-md-3 text-end">
              <div className="d-flex gap-2 justify-content-end">
                {isCoordinator && (
                  <button className="btn btn-primary btn-sm" onClick={handleAddTeachers}>
                    <i className="fas fa-user-plus me-1"></i>Add Teachers
                  </button>
                )}
                <Link to="/projects" className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-project-diagram me-1"></i>Projects
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid py-4">
        <div className="row">
          {/* Quick Actions Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-lg rounded-4 mb-4">
              <div className="card-header bg-gradient-primary text-white text-center py-3 rounded-top-4">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-bolt me-2"></i>Quick Actions
                </h5>
              </div>
              <div className="card-body p-3">
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary btn-lg rounded-3"
                    onClick={handleAssignedProjects}
                  >
                    <i className="fas fa-tasks me-2"></i>
                    Assigned Projects
                  </button>
                  
                  {isCoordinator && (
                    <>
                      <Link 
                        to="/uploadRequest" 
                        className="btn btn-outline-success btn-lg rounded-3"
                      >
                        <i className="fas fa-upload me-2"></i>
                        Upload Requests
                      </Link>
                      
                      <Link 
                        to="/ArchiveProjects" 
                        className="btn btn-outline-warning btn-lg rounded-3"
                      >
                        <i className="fas fa-archive me-2"></i>
                        Archive Projects
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-header bg-gradient-info text-white text-center py-3 rounded-top-4">
                <h6 className="mb-0 fw-bold">
                  <i className="fas fa-user-circle me-2"></i>User Info
                </h6>
              </div>
              <div className="card-body text-center p-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                     style={{width: '60px', height: '60px'}}>
                  <i className="fas fa-user fa-2x"></i>
                </div>
                <h6 className="mb-1 fw-bold text-dark">{userType}</h6>
                <small className="text-muted">Logged in successfully</small>
              </div>
            </div>
          </div>

          {/* Main Content - Teachers Projects */}
          <div className="col-lg-9">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-header bg-gradient-success text-white text-center py-3 rounded-top-4">
                <h4 className="mb-0 fw-bold">
                  <i className="fas fa-chalkboard-teacher me-2"></i>
                  Teachers & Projects
                </h4>
                <p className="mb-0 mt-2 opacity-75">Browse available projects by teachers</p>
              </div>
              <div className="card-body p-4">
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="text-muted">Loading teachers...</h5>
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No teachers available</h5>
                    <p className="text-muted">Teachers will appear here once they are added to the system.</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {teachers.map((teacher) => (
                      <div className="col-sm-6 col-md-4 col-lg-4" key={teacher._id}>
                        <div className="card border-0 shadow-sm h-100 rounded-4 teacher-card">
                          <div className="card-body p-4 text-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                 style={{width: '70px', height: '70px'}}>
                              <i className="fas fa-user-tie fa-2x"></i>
                            </div>
                            <h5 className="card-title fw-bold text-dark mb-2">{teacher.name}</h5>
                            <p className="card-text text-muted mb-3">
                              <i className="fas fa-project-diagram me-2 text-primary"></i>
                              {teacher.project || "Project Type Not Specified"}
                            </p>
                            <div className="d-grid">
                              <button
                                className="btn btn-primary rounded-3 shadow-sm"
                                onClick={() => handleViewProjects(teacher.name)}
                              >
                                <i className="fas fa-eye me-2"></i>
                                View Projects
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Home;
