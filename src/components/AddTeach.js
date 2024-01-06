import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/style.css";
import "bootstrap/dist/css/bootstrap.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../logo.jpg";


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
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Fetch the list of teachers from the backend when the component mounts
    fetchTeachers();
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher((prevTeacher) => ({
      ...prevTeacher,
      [name]: value,
    }));
  };
  const handleAddTeacher = async () => {
    if (
      !newTeacher.teacherId ||
      !newTeacher.name ||
      !newTeacher.project ||
      !newTeacher.email ||
      !newTeacher.password
    ) {
      setNotification({ type: "error", message: "All fields are required" });
      return;
    }

    if (!/(?=.*[A-Z])(?=.*[0-9]).{6,}/.test(newTeacher.password)) {
      setNotification({
        type: "error",
        message: "Password should be at least 6 characters long, contain at least 1 capital letter, and 1 number",
      });
      return;
    }
    const teacherWithSameId = teachers.find(
      (teacher) => teacher.teacherId === newTeacher.teacherId
    );

    if (teacherWithSameId) {
      toast.error("Teacher with the same ID already exists", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
      return;
    }
    try {
      const teacherToAdd = { ...newTeacher };
      const response = await axios.post("http://localhost:9000/addteacher", teacherToAdd);

      if (response.data.success) {
        setTeachers((prevTeachers) => [...prevTeachers, response.data.teacher]);
        toast.success("Teacher added successfully", {
          position: toast.POSITION.TOP_LEFT,
          autoClose: 3000,
        });

        setNewTeacher({
          teacherId: "",
          name: "",
          project: "",
          email: "",
          password: "",
        });
      } else {
        toast.error("Failed to add teacher", {
          position: toast.POSITION.TOP_LEFT,
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error("Failed to add teacher", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
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
    try {
      const teacherToEdit = teachers.find((teacher) => teacher._id === teacherId);

      // Check if any changes were made to the teacher details
      if (
        teacherToEdit.name === editedTeacher.name &&
        teacherToEdit.project === editedTeacher.project &&
        teacherToEdit.email === editedTeacher.email &&
        teacherToEdit.password === editedTeacher.password
      ) {
        setNotification({ type: "error", message: "No changes made to teacher details" });
        return;
      }

      const response = await axios.put(`http://localhost:9000/teachers/${teacherId}`, editedTeacher);
      if (response.data.success) {
        // Teacher details updated successfully, update the teacher list
        const updatedTeachers = teachers.map((teacher) =>
          teacher._id === teacherId ? { ...teacher, ...editedTeacher } : teacher
        );
        setTeachers(updatedTeachers);
        setNotification({ type: "success", message: "Teacher details updated successfully" });
        setEditedTeacher(null); // Clear the editedTeacher state after successful update
      } else {
        // Show an error message or handle the failure case
        setNotification({ type: "error", message: "Failed to update teacher details" });
      }
    } catch (error) {
      console.error("Error updating teacher details:", error);
      setNotification({ type: "error", message: "Failed to update teacher details" });
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    try {
      await axios.delete(`http://localhost:9000/teachers/${teacherId}`);

      // Teacher deleted successfully, update the teacher list and show success notification
      setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher._id !== teacherId));
      setNotification({ type: "success", message: "Teacher deleted successfully" });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      setNotification({ type: "error", message: "Failed to delete teacher" });
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:9000/teachers");
      setTeachers(response.data); // Assuming the response data is an array of teachers
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  return (
    <div>
      {notification && (
        <div className={`alert alert-${notification.type}`}>{notification.message}</div>
      )}
      <header className="header">
        <img
          src={logo}
          alt="QAU Logo"
          height="70"
          width="70"
        />
        <h3>Welcome to FYP Portal</h3>
        <div className="header-buttons">
          <Link to="/Teachers" className="btn btn-primary ml-2">
            Teachers
          </Link>
          <Link to="/projects" className="btn btn-primary ml-2">
            Projects
          </Link>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <br />
      
      <div className="content">
        <div className="admin-form text-center">
        <br /><br />
          <center>
            <h2>Add Teacher</h2>
          </center>

          {/* ... (previous form code) ... */}
          <div className="form-group">
            <label htmlFor="teacherId">Teacher ID:</label>
            <input
              type="text"
              id="teacherId"
              name="teacherId"
              className="form-control"
              value={editedTeacher ? editedTeacher.teacherId : newTeacher.teacherId}
              onChange={editedTeacher ? handleEditInputChange : handleInputChange}
              disabled={editedTeacher} // Disable editing for existing teachers
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Teacher Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={editedTeacher ? editedTeacher.name : newTeacher.name}
              onChange={editedTeacher ? handleEditInputChange : handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Project Type:</label>
            <input
              type="text"
              id="project"
              name="project"
              className="form-control"
              value={editedTeacher ? editedTeacher.project : newTeacher.project}
              onChange={editedTeacher ? handleEditInputChange : handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Teacher Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={editedTeacher ? editedTeacher.email : newTeacher.email}
              onChange={editedTeacher ? handleEditInputChange : handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Teacher Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={editedTeacher ? editedTeacher.password : newTeacher.password}
              onChange={editedTeacher ? handleEditInputChange : handleInputChange}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={editedTeacher ? () => handleUpdateTeacher(editedTeacher._id) : handleAddTeacher}
          >
            {editedTeacher ? "Update Teacher" : "Add Teacher"}
          </button>
        </div>
        <br />
        <div className="teacher-list">
          <center>
            <h2>Teacher List</h2>
          </center>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => setEditedTeacher(teacher)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteTeacher(teacher._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default AdminInterface;
