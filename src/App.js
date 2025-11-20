// import './App.css'
import AddTeach from"./components/AddTeach";
import Home from "./components/Home";
import Projects from "./components/projects";
import Upload from "./components/uploads"
import Request from "./components/requests"
import UplRequest from "./components/UploadRequest"
import Login from "./components/auth/login"
import Signup from "./components/auth/signupstud"
import Loginteach from "./components/auth/teaclogin"
import LoginCo from "./components/auth/coordlogin"
import CoordSignup from "./components/auth/coordsignup"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FYP1 from "./components/FYP1";
import Notification from "./components/Notifications";
import ForgetPsw from "./components/auth/ForgotPwd";
import Resetpsw from "./components/auth/ResetPsw";
import ForgotPassword from "./components/auth/ForgotPassword";
import Assigned from "./components/Assigned";
import EditRequests from "./components/EditRequests";
import ApprovedRequest from "./ApprovedRequests";
import Archive from "./components/archive";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Auth routes without layout */}
          <Route path="/" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/teacherlogin" element={<Loginteach/>}/>
          <Route path="/coordlogin" element={<LoginCo/>}/>
          <Route path="/coordsignup" element={<CoordSignup/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/forgotpwd" element={<ForgotPassword/>}/>
          <Route path="/reset-password" element={<Resetpsw/>}/>

          {/* App routes with shared Layout */}
          <Route path="/AddTeach" element={<Layout><AddTeach/></Layout>}/>
          <Route path="/Teachers" element={<ProtectedRoute><Layout><Home/></Layout></ProtectedRoute>}/>
          <Route path="/projects" element={<ProtectedRoute><Layout><Projects/></Layout></ProtectedRoute>}/>
          <Route path="/uploads" element={<ProtectedRoute><Layout><Upload/></Layout></ProtectedRoute>}/>
          <Route path="/fyp1" element={<ProtectedRoute><Layout><FYP1/></Layout></ProtectedRoute>}/>
          <Route path="/requests" element={<ProtectedRoute><Layout><Request/></Layout></ProtectedRoute>}/>
          <Route path="/uploadRequest" element={<ProtectedRoute><Layout><UplRequest/></Layout></ProtectedRoute>}/>
          <Route path="/Notification" element={<ProtectedRoute><Layout><Notification/></Layout></ProtectedRoute>}/>
          <Route path="/assigned" element={<ProtectedRoute><Layout><Assigned/></Layout></ProtectedRoute>}/>
          <Route path="/edit-requests" element={<ProtectedRoute><Layout><EditRequests/></Layout></ProtectedRoute>}/>
          <Route path="/ApprovedRequests" element={<ProtectedRoute><Layout><ApprovedRequest/></Layout></ProtectedRoute>}/>
          <Route path="/ArchiveProjects" element={<ProtectedRoute><Layout><Archive/></Layout></ProtectedRoute>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;