import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "../css/style.css";
import logo from "../logo.jpg";

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    navigate("/");
    window.location.reload();
  };

  const userType = (localStorage.getItem("userType") || "").toLowerCase();

  return (
    <div className="min-vh-100 d-flex" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
      {/* Sidebar */}
      <aside className="d-none d-md-flex flex-column justify-content-between text-white p-3" style={{width: 260, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div>
          <div className="text-center mb-4">
            <img src={logo} alt="Logo" className="rounded-circle shadow" style={{width: 70, height: 70}} />
            <h5 className="fw-bold mt-2">FYP Portal</h5>
            <small className="text-white-50">QAU Islamabad</small>
          </div>
          <nav className="nav flex-column gap-2">
            <Link to="/Teachers" className="btn btn-light btn-sm text-start"><i className="fas fa-home me-2"></i>Home</Link>
            <Link to="/projects" className="btn btn-outline-light btn-sm text-start"><i className="fas fa-project-diagram me-2"></i>Projects</Link>
            {userType === "coordinator" && (
              <>
                <Link to="/AddTeach" className="btn btn-outline-light btn-sm text-start"><i className="fas fa-user-plus me-2"></i>Add Teachers</Link>
                <Link to="/ApprovedRequests" className="btn btn-outline-light btn-sm text-start"><i className="fas fa-check me-2"></i>Approved</Link>
                <Link to="/ArchiveProjects" className="btn btn-outline-light btn-sm text-start"><i className="fas fa-archive me-2"></i>Archive</Link>
              </>
            )}
            {userType === "teacher" && (
              <Link to="/uploads" className="btn btn-outline-light btn-sm text-start"><i className="fas fa-upload me-2"></i>Uploads</Link>
            )}
            {userType === "student" && (
              <Link to="/Notification" className="btn btn-outline-light btn-sm text-start"><i className="fas fa-bell me-2"></i>Notifications</Link>
            )}
          </nav>
        </div>
        <div className="text-center">
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i>Logout</button>
          <p className="small text-white-50 mt-2 mb-0">© 2024 FYP Portal</p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container-fluid py-2">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <img src={logo} alt="Logo" width="40" height="40" className="rounded-circle me-2" />
                <h6 className="mb-0 fw-bold text-primary">Final Year Project Portal</h6>
              </div>
              <div className="d-flex gap-2">
                <Link to="/projects" className="btn btn-outline-primary btn-sm"><i className="fas fa-project-diagram me-1"></i>Projects</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="container-fluid p-3">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white text-center py-2 border-top mt-auto">
          <small className="text-muted">Crafted with ❤️ for better UX • All rights reserved</small>
        </footer>
      </div>
    </div>
  );
}

export default Layout;


