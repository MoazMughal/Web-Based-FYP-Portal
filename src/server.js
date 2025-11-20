const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { hashPassword, comparePassword } = require("./auth/passwordUtils");

// Load .env from src folder
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Fyplogin", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Schemas
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true },
  name: { type: String, required: true },
  project: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const coordinatorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const projectSchema = new mongoose.Schema({
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  projectName: { type: String, required: true },
  projectDomain: { type: String, required: true },
  projectDescription: { type: String, required: true },
  projectFile: { type: String, required: true },
  posted: { type: Boolean, default: false },
});

const requestSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  studentId: { type: String, required: true },
  projectName: { type: String, required: true },
  studentName: { type: String, required: true },
  status: { type: String, default: "Pending" },
});

const assignStudentProjectSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  projectName: { type: String },
  teacherName: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, default: "pending" },
  assignmentDate: { type: Date, default: Date.now }
});

const editRequestSchema = new mongoose.Schema({
  teacherId: { type: String, required: true },
  projectName: { type: String, required: true },
  projectDomain: { type: String },
  projectFile: { type: String },
  message: { type: String, required: true },
  status: { type: String, default: "Pending" },
  projectId: { type: String }
});

const archiveProjectsSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  projectName: { type: String },
  teacherName: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, default: "pending" },
  assignmentDate: { type: Date, default: Date.now },
  semester: { type: String },
  year: { type: Number, default: new Date().getFullYear() },
});

// Models
const Student = mongoose.model("Students", studentSchema);
const Teacher = mongoose.model("Teachers", teacherSchema);
const Coordinator = mongoose.model("Coordinators", coordinatorSchema);
const Project = mongoose.model("Project", projectSchema);
const Request = mongoose.model('Request', requestSchema);
const AssignStudentProject = mongoose.model('AssignStudentProject', assignStudentProjectSchema);
const EditRequest = mongoose.model("EditRequest", editRequestSchema);
const ArchiveProjects = mongoose.model("ArchiveProjects", archiveProjectsSchema);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Import and initialize authentication routes
const { router: authRouter, initializeModels } = require('./auth/authRoutes');
initializeModels({ Student, Teacher, Coordinator });

// Use authentication routes
app.use('/api/auth', authRouter);

// Legacy Authentication Routes (updated with password hashing)
app.post("/studentlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid student credentials" });
    }

    // Compare password with hashed password
    const isPasswordValid = await comparePassword(password, student.password);
    if (isPasswordValid) {
      res.status(200).json({ 
        success: true, 
        message: "Student login successful", 
        studentId: student.studentId, 
        studentName: student.name 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid student credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/teacherlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ success: false, message: "Invalid teacher credentials" });
    }

    // Compare password with hashed password
    const isPasswordValid = await comparePassword(password, teacher.password);
    if (isPasswordValid) {
      res.status(200).json({ 
        success: true, 
        message: "Teacher login successful", 
        teacherId: teacher.teacherId, 
        teacherName: teacher.name  
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid teacher credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Coordinator Signup Route
app.post("/signup/coordinator", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Check if coordinator with this email already exists
    const existingCoordinator = await Coordinator.findOne({ email });

    if (existingCoordinator) {
      return res.json("exist"); // Coordinator with this email already exists
    }

    // Hash password before saving
    console.log('🔐 Hashing password for new coordinator:', email);
    const hashedPassword = await hashPassword(password);

    // Create new coordinator
    const newCoordinator = new Coordinator({ email, password: hashedPassword });
    await newCoordinator.save();

    console.log('✅ Coordinator registered successfully:', email);
    res.json("notexist"); // Coordinator created successfully
  } catch (error) {
    console.error("Error registering coordinator:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// Coordinator Login Route
app.post("/coordinatorlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const coordinator = await Coordinator.findOne({ email });
    if (!coordinator) {
      return res.status(401).json({ success: false, message: "Invalid coordinator credentials" });
    }

    // Compare password with hashed password
    const isPasswordValid = await comparePassword(password, coordinator.password);
    if (isPasswordValid) {
      // Create a simple token (for demonstration - consider using JWT for production)
      const token = `coord-${Date.now()}-${Math.random().toString(36).substr(2)}`;
      
      res.status(200).json({ 
        success: true, 
        message: "Coordinator login successful", 
        token: token,
        email: coordinator.email 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid coordinator credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/signup/student", async (req, res) => {
  const { name, studentId, email, password } = req.body;

  try {
    // Validate required fields
    if (!name || !studentId || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    const existingStudentWithEmail = await Student.findOne({ email });
    const existingStudentWithId = await Student.findOne({ studentId });

    if (existingStudentWithEmail) {
      return res.json("exist");
    } else if (existingStudentWithId) {
      return res.status(409).json("IDExist");
    }

    // Hash password before saving
    console.log('🔐 Hashing password for new student:', email);
    const hashedPassword = await hashPassword(password);

    const newStudent = new Student({ name, studentId, email, password: hashedPassword });
    await newStudent.save();
    
    console.log('✅ Student registered successfully:', email);
    res.json("notexist");
  } catch (error) {
    console.error("Error registering student:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// Teacher Management Routes
app.post("/addteacher", async (req, res) => {
  const { teacherId, name, project, email, password } = req.body;

  if (!name || !project || !email || !password || !teacherId) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({ success: false, message: "Teacher with the same email already exists" });
    }

    // Hash password before saving
    console.log('🔐 Hashing password for new teacher:', email);
    const hashedPassword = await hashPassword(password);

    const newTeacher = new Teacher({ teacherId, name, project, email, password: hashedPassword });
    await newTeacher.save();

    console.log('✅ Teacher added successfully:', email);
    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      teacher: newTeacher,
    });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/teacherIds", async (req, res) => {
  try {
    const teacherIds = await Teacher.find({}, 'teacherId');
    res.json(teacherIds);
  } catch (error) {
    console.error("Error fetching teacher IDs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.put("/teachers/:id", async (req, res) => {
  const teacherId = req.params.id;
  const { name, project, email, password } = req.body;

  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    teacher.name = name;
    teacher.project = project;
    teacher.email = email;
    teacher.password = password;
    await teacher.save();

    res.json({ success: true, message: "Teacher details updated successfully" });
  } catch (error) {
    console.error("Error updating teacher details:", error);
    res.status(500).json({ success: false, message: "Failed to update teacher details" });
  }
});

app.delete("/teachers/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    await Teacher.deleteOne({ _id: teacherId });
    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: "Failed to delete teacher" });
  }
});

// Project Management Routes
app.post("/projects", upload.single("projectFile"), async (req, res) => {
  try {
    const teacherId = req.body.teacherId;
    const teacherName = req.body.teacherName;
    const { projectName, projectDomain, projectDescription } = req.body;
    const projectFile = req.file.filename;

    const defaultDescription = "Project Description Added in file";
    const existingProject = await Project.findOne({ projectName });

    if (existingProject) {
      return res.status(400).json({ success: false, message: "Project with this name already exists" });
    }

    const project = new Project({
      teacherId,
      teacherName,
      projectName,
      projectDomain,
      projectDescription: projectDescription || defaultDescription,
      projectFile,
      posted: false,
    });

    await project.save();
    res.json({ success: true, message: "Project uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error uploading project" });
  }
});

app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find({ posted: true });
    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching projects" });
  }
});

app.get("/projects/unposted", async (req, res) => {
  try {
    const projects = await Project.find({ posted: false });
    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching unposted projects" });
  }
});

app.get("/projects/:teacherId", async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
    const projects = await Project.find({ posted: true, teacherId });
    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching projects" });
  }
});

app.post("/projects/approve/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    project.posted = true;
    await project.save();
    return res.json({ success: true, message: "Project posted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Additional routes for file download, project updates, etc.
app.get("/projects/file/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const filePath = path.join(__dirname, `uploads/${project.projectFile}`);
    const fileExtension = project.projectFile.split(".").pop();

    if (fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "png") {
      res.sendFile(filePath);
    } else {
      res.setHeader("Content-Disposition", `attachment; filename="${project.projectFile}"`);
      res.sendFile(filePath);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Request Management Routes
app.post("/requests", async (req, res) => {
  try {
    const { projectId, studentName, studentId, teacherId, teacherName, projectName } = req.body;

    const isProjectAssigned = await AssignStudentProject.findOne({ projectId });
    const isProjectInArchive = await ArchiveProjects.findOne({ projectId });

    if (isProjectAssigned || isProjectInArchive) {
      return res.status(400).json({ success: false, message: "Project has already been assigned or archived" });
    }

    const newRequest = new Request({
      projectId,
      teacherId,
      teacherName,
      studentName,
      studentId,
      projectName,
    });

    await newRequest.save();
    res.json({ success: true, message: "Request sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error sending request" });
  }
});

app.get("/requests/:teacherId", async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
    const requests = await Request.find({ teacherId });
    res.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching requests" });
  }
});

// Teacher approves a student's project request (moves to coordinator stage)
app.post("/requests/approve/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    // Mark as Approved (Pending Coordinator Final Approval)
    request.status = "Approved";
    await request.save();
    return res.json({ success: true });
  } catch (error) {
    console.error("Error approving request:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Teacher disapproves a student's project request
app.post("/requests/disapprove/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    request.status = "Disapproved";
    await request.save();
    return res.json({ success: true });
  } catch (error) {
    console.error("Error disapproving request:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Coordinator view of teacher-approved requests
app.get("/approved-projects", async (_req, res) => {
  try {
    const approvedProjects = await Request.find({ status: "Approved" });
    return res.json({ success: true, approvedProjects });
  } catch (error) {
    console.error("Error fetching approved projects:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Coordinator final assignment of a project to the student
app.post("/assigned-projects/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Prevent duplicate assignment
    const existingAssignment = await AssignStudentProject.findOne({ projectId: request.projectId });
    if (existingAssignment) {
      return res.status(400).json({ success: false, message: "Project already assigned" });
    }

    const assignment = new AssignStudentProject({
      studentId: request.studentId,
      studentName: request.studentName,
      projectName: request.projectName,
      teacherName: request.teacherName,
      projectId: request.projectId,
      status: "Assigned",
    });
    await assignment.save();

    // Optionally mark the request as Assigned or remove it
    await Request.deleteOne({ _id: requestId });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error assigning project:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Remove a request (used by coordinator UI)
app.delete("/requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    await Request.deleteOne({ _id: requestId });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting request:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// List all assigned projects (visible on Notifications page)
app.get("/assigned-projects", async (_req, res) => {
  try {
    const projects = await AssignStudentProject.find();
    return res.json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// List all archived projects (visible in Archive page)
app.get("/archive-projects", async (_req, res) => {
  try {
    const projects = await ArchiveProjects.find();
    return res.json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching archive projects:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Password Reset Routes
app.post("/check-student-email", async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (student) {
      res.status(200).json({ valid: true });
    } else {
      res.status(200).json({ valid: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/check-email", async (req, res) => {
  const { email } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (teacher) {
      res.status(200).json({ valid: true });
    } else {
      res.status(200).json({ valid: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  try {
    const user = await Student.findOne({ email });
    let updatedUser;

    if (user) {
      updatedUser = await Student.findOneAndUpdate(
        { email },
        { password: newPassword },
        { new: true }
      );
    } else {
      updatedUser = await Teacher.findOneAndUpdate(
        { email },
        { password: newPassword },
        { new: true }
      );
    }

    if (updatedUser) {
      res.status(200).json({ success: true, message: "Password reset successful" });
    } else {
      res.status(400).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});