import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/style.css";
import "bootstrap/dist/css/bootstrap.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminInterface() {
  const navigate = useNavigate();
  const [editedTeacher, setEditedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    teacherId: "",
    name: "",
    project: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    // Check for valid session
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    
    if (!token || userType !== "coordinator") {
      toast.error("Access denied. Please login as coordinator.", { position: toast.POSITION.TOP_CENTER });
      localStorage.clear();
      navigate("/");
      return;
    }
    
    fetchTeachers();
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    navigate("/");
    window.location.reload();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher((prevTeacher) => ({
      ...prevTeacher,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!newTeacher.teacherId.trim()) {
      toast.error("Teacher ID is required", { position: toast.POSITION.TOP_CENTER });
      return false;
    }
    if (!newTeacher.name.trim()) {
      toast.error("Teacher name is required", { position: toast.POSITION.TOP_CENTER });
      return false;
    }
    if (!newTeacher.project.trim()) {
      toast.error("Project type is required", { position: toast.POSITION.TOP_CENTER });
      return false;
    }
    if (!newTeacher.email.trim()) {
      toast.error("Email is required", { position: toast.POSITION.TOP_CENTER });
      return false;
    }
    if (!newTeacher.password.trim()) {
      toast.error("Password is required", { position: toast.POSITION.TOP_CENTER });
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newTeacher.email)) {
      toast.error("Please enter a valid email address", { position: toast.POSITION.TOP_CENTER });
      return false;
    }

    // Password validation
    if (newTeacher.password.length < 6) {
      toast.error("Password must be at least 6 characters long", { position: toast.POSITION.TOP_CENTER });
      return false;
    }

    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(newTeacher.password)) {
      toast.error("Password must contain at least 1 capital letter and 1 number", { position: toast.POSITION.TOP_CENTER });
      return false;
    }

    return true;
  };

  const handleAddTeacher = async () => {
    if (!validateForm()) return;

    const teacherWithSameId = teachers.find(
      (teacher) => teacher.teacherId === newTeacher.teacherId
    );

    if (teacherWithSameId) {
      toast.error("Teacher with the same ID already exists", { position: toast.POSITION.TOP_CENTER });
      return;
    }

    setIsLoading(true);
    try {
      const teacherToAdd = { ...newTeacher };
      const response = await axios.post("http://localhost:8000/addteacher", teacherToAdd);

      if (response.data.success) {
        toast.success("Teacher added successfully!", { position: toast.POSITION.TOP_CENTER });
        setNewTeacher({
          teacherId: "",
          name: "",
          project: "",
          email: "",
          password: "",
        });
        fetchTeachers();
      } else {
        toast.error(response.data.message || "Failed to add teacher", { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error("Error adding teacher. Please try again.", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTeacher((prevTeacher) => ({
      ...prevTeacher,
      [name]: value,
    }));
  };

  const handleUpdateTeacher = async (teacherId) => {
    if (!editedTeacher.name.trim() || !editedTeacher.project.trim() || !editedTeacher.email.trim() || !editedTeacher.password.trim()) {
      toast.error("All fields are required", { position: toast.POSITION.TOP_CENTER });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(`http://localhost:8000/teachers/${teacherId}`, editedTeacher);

      if (response.data.success) {
        toast.success("Teacher updated successfully!", { position: toast.POSITION.TOP_CENTER });
        setEditedTeacher(null);
        fetchTeachers();
      } else {
        toast.error("Failed to update teacher", { position: toast.POSITION.TOP_CENTER });
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("Error updating teacher. Please try again.", { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        const response = await axios.delete(`http://localhost:8000/teachers/${teacherId}`);

        if (response.data.success) {
          toast.success("Teacher deleted successfully!", { position: toast.POSITION.TOP_CENTER });
          fetchTeachers();
        } else {
          toast.error("Failed to delete teacher", { position: toast.POSITION.TOP_CENTER });
        }
      } catch (error) {
        console.error("Error deleting teacher:", error);
        toast.error("Error deleting teacher. Please try again.", { position: toast.POSITION.TOP_CENTER });
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const resetForm = () => {
    setEditedTeacher(null);
    setNewTeacher({
      teacherId: "",
      name: "",
      project: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-0">
        <div className="container-fluid">
          <div className="row align-items-center py-2">
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <h5 className="mb-0 text-primary fw-bold">Teacher Management</h5>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <h6 className="mb-0 text-dark fw-bold">Add/Edit Teachers</h6>
            </div>
            <div className="col-md-4 text-end">
              <div className="d-flex gap-2 justify-content-end">
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate("/Teachers")}>
                  <i className="fas fa-home me-1"></i>Home
                </button>
                {/* Logout handled globally in Layout sidebar */}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid py-2">
        <div className="row">
          {/* Compact Form */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-header bg-gradient-primary text-white text-center py-2 rounded-top-3">
                <h6 className="mb-0 fw-bold">
                  <i className="fas fa-user-plus me-2"></i>
                  {editedTeacher ? "Edit Teacher" : "Add New Teacher"}
                </h6>
              </div>
              
              <div className="card-body p-3">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-2">
                    <label className="form-label fw-bold small mb-1">
                      <i className="fas fa-id-card me-1 text-primary"></i>Teacher ID
                    </label>
                    <input
                      type="text"
                      name="teacherId"
                      className="form-control form-control-sm border-1 rounded-2"
                      value={editedTeacher ? editedTeacher.teacherId : newTeacher.teacherId}
                      onChange={editedTeacher ? handleEditInputChange : handleInputChange}
                      disabled={editedTeacher}
                      placeholder="Enter Teacher ID"
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label className="form-label fw-bold small mb-1">
                      <i className="fas fa-user me-1 text-primary"></i>Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-sm border-1 rounded-2"
                      value={editedTeacher ? editedTeacher.name : newTeacher.name}
                      onChange={editedTeacher ? handleEditInputChange : handleInputChange}
                      placeholder="Enter Full Name"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-bold small mb-1">
                      <i className="fas fa-project-diagram me-1 text-primary"></i>Project Type
                    </label>
                    <select
                      name="project"
                      className="form-select form-select-sm border-1 rounded-2"
                      value={editedTeacher ? editedTeacher.project : newTeacher.project}
                      onChange={editedTeacher ? handleEditInputChange : handleInputChange}
                    >
                      <option value="">Select Project Type</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="IoT">Internet of Things</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-2">
                    <label className="form-label fw-bold small mb-1">
                      <i className="fas fa-envelope me-1 text-primary"></i>Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-sm border-1 rounded-2"
                      value={editedTeacher ? editedTeacher.email : newTeacher.email}
                      onChange={editedTeacher ? handleEditInputChange : handleInputChange}
                      placeholder="Enter Email Address"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small mb-1">
                      <i className="fas fa-lock me-1 text-primary"></i>Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control form-control-sm border-1 rounded-2"
                      value={editedTeacher ? editedTeacher.password : newTeacher.password}
                      onChange={editedTeacher ? handleEditInputChange : handleInputChange}
                      placeholder="Enter Password"
                    />
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Min 6 chars, 1 capital, 1 number
                    </small>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-2 fw-bold ${
                        editedTeacher ? 'btn-warning' : 'btn-primary'
                      }`}
                      onClick={editedTeacher ? () => handleUpdateTeacher(editedTeacher._id) : handleAddTeacher}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {editedTeacher ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${editedTeacher ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                          {editedTeacher ? "Update Teacher" : "Add Teacher"}
                        </>
                      )}
                    </button>

                    {editedTeacher && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-2"
                        onClick={resetForm}
                      >
                        <i className="fas fa-times me-2"></i>Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Compact Teacher List */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-gradient-success text-white text-center py-2 rounded-top-3">
                <h6 className="mb-0 fw-bold">
                  <i className="fas fa-users me-2"></i>
                  Registered Teachers ({teachers.length})
                </h6>
              </div>
              <div className="card-body p-0">
                {teachers.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-users fa-2x text-muted mb-2"></i>
                    <h6 className="text-muted">No teachers registered yet</h6>
                    <p className="text-muted small">Start by adding a new teacher using the form.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 small">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 px-3 py-2">
                            <i className="fas fa-user me-1 text-primary"></i>Name
                          </th>
                          <th className="border-0 px-3 py-2">
                            <i className="fas fa-project-diagram me-1 text-success"></i>Project Type
                          </th>
                          <th className="border-0 px-3 py-2">
                            <i className="fas fa-envelope me-1 text-info"></i>Email
                          </th>
                          <th className="border-0 px-3 py-2 text-center">
                            <i className="fas fa-cogs me-1 text-warning"></i>Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.map((teacher) => (
                          <tr key={teacher._id} className="align-middle">
                            <td className="px-3 py-2">
                              <div className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                     style={{width: '30px', height: '30px'}}>
                                  <i className="fas fa-user fa-sm"></i>
                                </div>
                                <div>
                                  <div className="fw-bold small">{teacher.name}</div>
                                  <small className="text-muted">ID: {teacher.teacherId}</small>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                                {teacher.project}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <a href={`mailto:${teacher.email}`} className="text-decoration-none small">
                                {teacher.email}
                              </a>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="btn-group btn-group-sm" role="group">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => setEditedTeacher(teacher)}
                                  title="Edit Teacher"
                                >
                                  <i className="fas fa-edit fa-sm"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteTeacher(teacher._id)}
                                  title="Delete Teacher"
                                >
                                  <i className="fas fa-trash fa-sm"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default AdminInterface;
