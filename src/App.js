// import './App.css'
import AddTeach from"./components/AddTeach";
import Home from "./components/Home";
import Projects from "./components/projects";
import Upload from "./components/uploads"
import Request from "./components/requests"
import UplRequest from "./components/UploadRequest"
import Login from "./components/login"
import Signup from "./components/signupstud"
import Loginteach from "./components/teaclogin"
import LoginCo from "./components/coordlogin"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FYP1 from "./components/FYP1";
import Notification from "./components/Notifications";
import ForgetPsw from "./components/ForgotPwd";
import Resetpsw from "./components/ResetPsw";
import Assigned from "./components/Assigned";
import EditRequests from "./components/EditRequests";
import ApprovedRequest from "./ApprovedRequests";
import Archive from "./components/archive";
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/teacherlogin" element={<Loginteach/>}/>
          <Route path="/AddTeach" element={<AddTeach/>}/>
          <Route path="/Coologin" element={<LoginCo/>}/>
          <Route path="/Teachers" element={<Home/>}/>
          <Route path="/projects" element={<Projects/>}/>
          <Route path="/uploads" element={<Upload/>}/>
          <Route path="/fyp1" element={<FYP1/>}/>
          <Route path="/requests" element={<Request/>}/>
          <Route path="/uploadRequest" element={<UplRequest/>}/>
          <Route path="/Notification" element={<Notification/>}/>
          <Route path="/assigned" element={<Assigned/>}/>
          <Route path="/forgot-password" element={<ForgetPsw/>}/>
          <Route path="/reset-password" element={<Resetpsw/>}/>
          <Route path="/edit-requests" element={<EditRequests/>}/>
          <Route path="/ApprovedRequests" element={<ApprovedRequest/>}/>
          <Route path="/ArchiveProjects" element={<Archive/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;