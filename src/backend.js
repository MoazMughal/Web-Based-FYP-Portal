// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors());
// Serve static files
app.use(express.static("uploads"));


// MongoDB connection
mongoose.connect("mongodb://localhost:27017/fyp_portal", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

const projectSchema = new mongoose.Schema({
  teacherId: { type: String, required: true }, // Add this line
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
  studentName: { type: String, required: true }, // Add studentName field
  status: { type: String, default: "Pending" },
});

const assignStudentProjectSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  projectName: { type: String },
  teacherName: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, default: "pending" }, // Add the status field with default value "pending"
  assignmentDate: { type: Date, default: Date.now }
});

const editRequestSchema = new mongoose.Schema({
  teacherId: { type: String, required: true },
  projectName: { type: String, required: true },
  projectDomain: { type: String }, // Make this field optional by removing the 'required: true'
  projectFile: { type: String},
  message: { type: String, required: true },
  status: { type: String, default: "Pending" },
  projectId:{type: String}
});
const archiveProjectsSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  projectName: { type: String },
  teacherName: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, default: "pending" },
  assignmentDate: { type: Date, default: Date.now },
  semester: { type: String }, // Add semester field
  year: { type: Number, default: new Date().getFullYear() }, // Add year field with default as the current year
});

const ArchiveProjects = mongoose.model("ArchiveProjects", archiveProjectsSchema);

const EditRequest = mongoose.model("EditRequest", editRequestSchema);


const AssignStudentProject = mongoose.model('AssignStudentProject', assignStudentProjectSchema);



const Request = mongoose.model('Request', requestSchema);


const Project = mongoose.model("Project", projectSchema);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Upload a project
// When a teacher uploads a project, set posted to false initially
app.post("/projects", upload.single("projectFile"), async (req, res) => {
  try {
    const teacherId = req.body.teacherId;
    const teacherName = req.body.teacherName;
    const { projectName, projectDomain, projectDescription } = req.body;
    const projectFile = req.file.filename;

    // Set a default message if project description is not provided
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

// Create a new endpoint to handle the "Post" action
// Update the 'posted' status of a project to true
app.post("/projects/approve/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Update the project's 'posted' field to true
    project.posted = true;
    await project.save();

    return res.json({ success: true, message: "Project posted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/projects", async (req, res) => {
  try {
    // Modify this query to filter projects by the 'posted' field
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


app.get("/projects/teacher", async (req, res) => {
  try {
    // Modify this query to filter projects by the 'posted' field
    const projects = await Project.find({ posted: true, teacherId: teacherId });
    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching teacher's projects" });
  }
});

// Optionally, if you want to filter projects by the teacher who posted them, you can add a route like this:
// Optionally, if you want to filter projects by the teacher who posted them, you can add a route like this:
app.get("/projects/:teacherId", async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
    // Modify this query to filter projects by the 'posted' field and teacherId
    const projects = await Project.find({ posted: true, teacherId });

    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching projects" });
  }
});


app.get("/projects/posted", async (req, res) => {
  try {
    const projects = await Project.find({ posted: true });
    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching posted projects" });
  }
});


// Update the /projects route to filter projects by teacherId
app.get("/projects/:teacherId", async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
  
    const projects = await Project.find({ teacherId });
    

    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching projects" });
  }
});

// Example API endpoint for posting a project (server.js)
app.post("/projects/post", async (req, res) => {
  try {
    // Implement your authentication logic here to ensure only coordinators can access this endpoint
    
    // Update the 'posted' field of the project to true
    const projectId = req.body.projectId;
    const project = await Project.findByIdAndUpdate(projectId, { posted: true });

    if (!project) {
      return res.json({ success: false, message: "Project not found" });
    }

    return res.json({ success: true, message: "Project posted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});


app.get("/projects/file/:projectId", (req, res) => {
  const projectId = req.params.projectId;

  Project.findById(projectId, (err, project) => {
    if (err || !project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const filePath = path.join(__dirname, `uploads/${project.projectFile}`);
    const fileExtension = project.projectFile.split(".").pop();

    if (fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "png") {
      // If the file is an image, display it in the browser
      res.sendFile(filePath);
    } else {
      // If the file is not an image, trigger a download
      res.setHeader("Content-Disposition", `attachment; filename="${project.projectFile}"`);
      res.sendFile(filePath);
    }
  });
});

app.get("/projects/name/:teacherName", async (req, res) => {
  const teacherName = req.params.teacherName;

  try {
    const projects = await Project.find({ teacherName });
    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching projects" });
  }
});


app.put("/projects/:projectId", upload.single("projectFile"), async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { projectName, projectDomain, projectDescription } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    console.log("Found project:", project);

    project.projectName = projectName;
    project.projectDomain = projectDomain;
    project.projectDescription = projectDescription;

    console.log("Project data after update:", project);

    if (req.file) {
      const newProjectFile = req.file.filename;
      const oldFilePath = path.join(__dirname, `uploads/${project.projectFile}`);

      console.log("New project file:", newProjectFile);
      console.log("Old file path:", oldFilePath);

      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old project file:", err);
        }
      });

      project.projectFile = newProjectFile;
      console.log("Project file updated:", project);
    }

    await project.save();
    console.log("Project saved successfully");

    res.json({ success: true, message: "Project updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating project" });
  }
});



app.delete("/projects/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId; // Correctly getting project ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const filePath = `uploads/${project.projectFile}`;

    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error deleting project file" });
      }

      await project.remove();
      res.json({ success: true, message: "Project deleted successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting project" });
  }
});

app.post("/requests", async (req, res) => {
  try {
    const { projectId, studentName, studentId, teacherId, teacherName, projectName } = req.body;

    // Check if the project has already been assigned
    const isProjectAssigned = await AssignStudentProject.findOne({ projectId });
    const isProjectInArchive = await ArchiveProjects.findOne({ projectId });

    if (isProjectAssigned || isProjectInArchive) {
      return res.status(400).json({ success: false, message: "Project has already been assigned or archived" });
    }
    // Create a new request
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

// Assume this is the route to update the project status to 'Approved' based on the project ID
app.post("/requests/approve/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const request = await Request.findById(projectId);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Update the request's status to 'Approved'
    request.status = "Approved";
    await request.save();

    res.json({ success: true, message: "Project request approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error approving the project request" });
  }
});

app.post("/requests/disapprove/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const request = await Request.findById(projectId);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Update the request's status to 'Disapproved'
    request.status = "Disapproved";
    await request.save();

    res.json({ success: true, message: "Project request disapproved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error disapproving the project request" });
  }
});

app.post('/projects/share/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    // Fetch the project from the database
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Assuming you have a specific attribute to mark a project as shared
    project.shared = true; // Setting a flag for shared projects
    await project.save();

    return res.status(200).json({ success: true, message: 'Project details shared successfully' });
  } catch (error) {
    console.error('Error sharing project:', error);
    return res.status(500).json({ success: false, message: 'Failed to share project details' });
  }
});


// ... (other code)

// Add the following route to fetch requests based on teacherId
app.get("/requests/:teacherId", async (req, res) => {
  const teacherId = req.params.teacherId;
  //console.log("Teacher ID from request:", teacherId); // Log teacherId

  try {
    const requests = await Request.find({ teacherId });
    //console.log(requests); // Check if you're getting the requests
    res.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching requests" });
  }
});

app.get("/requests/pending/:studentId", async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const pendingRequests = await Request.find({ studentId, status: "Pending" });
    res.json({ success: true, pendingRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching pending requests" });
  }
});
app.get("/approved-projects", async (req, res) => {
  try {
    const approvedProjects = await Request.find({ status: "Approved" }); // Assuming the status field is named 'status' in the database
    res.json({ success: true, approvedProjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching approved projects" });
  }
});

app.get("/projects/status/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, status: project.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching project status" });
  }
});

// Add this route to remove a request by its ID
app.delete("/requests/:requestId", async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    await request.remove();

    res.json({ success: true, message: "Request removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error removing request" });
  }
});


// Add this route to fetch approved requests for a specific student by name

app.get("/assigned/:studentName", async (req, res) => {
  const studentName = req.params.studentName;

  try {
    const assignedProjects = await AssignStudentProject.find({ studentName });
    res.json({ success: true, projects: assignedProjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching assigned projects" });
  }
});

app.delete("/assigned/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const assignedProject = await AssignStudentProject.findByIdAndDelete(projectId);

    if (!assignedProject) {
      return res.status(404).json({ success: false, message: "Assigned project not found" });
    }

    res.json({ success: true, message: "Assigned project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting assigned project" });
  }
});

app.delete("/projects/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Delete the project's file from the uploads directory
    const filePath = path.join(__dirname, `uploads/${project.projectFile}`);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting project file:", err);
      }
    });

    // Remove the project from the database
    await project.remove();
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting project" });
  }
});

// Add this route to handle edit request messages
app.post("/projects/edit-request/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const { message, projectFile } = req.body; // Include projectFile in the request body

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const teacherId = project.teacherId;

    const newEditRequest = new EditRequest({
      teacherId,
      projectName: project.projectName,
      projectDomain: project.projectDomain,
      projectFile, // Use the provided projectFile instead of projectDescription
      message,
      projectId
    });

    const savedEditRequest = await newEditRequest.save();

    res.json({ success: true, message: "Edit request message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error sending edit request message" });
  }
});




app.post("/edit-requests", async (req, res) => {
  const { teacherId, projectName, message } = req.body;

  try {
    const newRequest = new EditRequest({
      teacherId,
      projectName,
      message,
      status: "Pending", // Set the default status
    });

    const savedRequest = await newRequest.save();
    res.json({ success: true, request: savedRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error sending edit request" });
  }
});

// Add this route to fetch edit requests based on teacherId
app.get("/edit-requests/:teacherId", async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
    const editRequests = await EditRequest.find({ teacherId });
    const projectDetails = await Promise.all(
      editRequests.map(async (request) => {
        const project = await Project.findOne({ projectName: request.projectName });
        return {
          _id: request._id,
          projectName: request.projectName,
          projectDomain: request.projectDomain,
          projectFile: project ? project.projectFile : '', // Assuming the project file is named 'projectFile'
          message: request.message,
          status: request.status,
          projectId:request.projectId
          // Include other necessary project details
        };
      })
    );
    res.json({ success: true, editRequests: projectDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching edit requests" });
  }
});

app.delete("/edit-requests/:requestId", async (req, res) => {
  const requestId = req.params.requestId;

  try {
    const editRequest = await EditRequest.findById(requestId);

    if (!editRequest) {
      return res.status(404).json({ success: false, message: "Edit request not found" });
    }

    await editRequest.remove();

    res.json({ success: true, message: "Edit request deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting edit request" });
  }
});

app.post("/assigned-projects/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Check if the project has already been assigned
    const isProjectAssigned = await AssignStudentProject.findOne({ projectId });

    if (isProjectAssigned) {
      return res.status(400).json({ success: false, message: "Project has already been assigned to a student" });
    }

    const approvedProject = await Request.findById(projectId);

    if (!approvedProject) {
      return res.status(404).json({ success: false, message: "Project not found in approved requests" });
    }

    const studentId = approvedProject.studentId;

    // Check if the student already has a project assigned
    const alreadyAssignedProject = await AssignStudentProject.findOne({ studentId });

    if (alreadyAssignedProject) {
      return res.status(400).json({ success: false, message: "This student already has a project assigned" });
    }

    const {
      studentName,
      projectName,
      teacherId,
      teacherName,
    } = approvedProject;

    // Create an instance of AssignStudentProject with 'Assigned' status
    const assignedProject = new AssignStudentProject({
      studentId,
      studentName,
      projectName,
      teacherId,
      teacherName,
      projectId,
      status: "Assigned", // Set the status to "Assigned"
    });

    // Save the assigned project to the AssignStudentProject collection
    await assignedProject.save();

    // Remove the project from the Request schema
    await approvedProject.remove();

    res.json({ success: true, message: "Project assigned successfully and removed from requests" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error assigning the project to the student and removing from requests" });
  }
});


app.get("/assigned-projects", async (req, res) => {
  try {
    const assignedProjects = await AssignStudentProject.find();
    res.json({ success: true, projects: assignedProjects });
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    res.status(500).json({ success: false, message: "Error fetching assigned projects" });
  }
});

app.get("/unassigned-projects", async (req, res) => {
  try {
    // Find projects that are not yet assigned
    const unassignedProjects = await Project.find({ status: "Unassigned" });

    res.json({ success: true, projects: unassignedProjects });
  } catch (error) {
    console.error("Error fetching unassigned projects:", error);
    res.status(500).json({ success: false, message: "Error fetching unassigned projects" });
  }
});

// ... (other code)

app.put("/assigned-projects/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const { status } = req.body;

  try {
    const updatedProject = await AssignStudentProject.findByIdAndUpdate(
      projectId,
      { status },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project status updated successfully", project: updatedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating project status" });
  }
});

app.post("/projects/archive/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const { semester, year } = req.body;

  try {
    const projectToArchive = await AssignStudentProject.findById(projectId);

    if (!projectToArchive) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const {
      studentId,
      studentName,
      projectName,
      teacherName,
      status,
      assignmentDate,
      year: projectYear,
    } = projectToArchive;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    if (status === "Unassigned") {
      return res.status(400).json({ success: false, message: "Cannot archive an unassigned project" });
    }

    if (projectYear === currentYear && year === currentYear) {
      return res.status(400).json({ success: false, message: "Cannot archive a project of the current year" });
    }

    if (projectYear === currentYear && semester === "Fall" && currentMonth < 6) {
      return res.status(400).json({ success: false, message: "Cannot archive a project of the current semester" });
    } else if (projectYear === currentYear && semester === "Spring" && currentMonth >= 6) {
      return res.status(400).json({ success: false, message: "Cannot archive a project of the current semester" });
    } else {
      // Update the status to "Archived"
      projectToArchive.status = "Archived";

      // Proceed to archive the project
      const archiveProject = new ArchiveProjects({
        studentId,
        studentName,
        projectName,
        teacherName,
        projectId,
        status: "Archived", // Set the status to "Archived"
        assignmentDate,
        semester,
        year: year || currentYear,
      });

      // Save the changes to the AssignStudentProject and archive the project
      await projectToArchive.save();
      await archiveProject.save();

      res.json({ success: true, message: "Project archived successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to archive the project" });
  }
});


app.get("/archive-projects", async (req, res) => {
  try {
    const archivedProjects = await ArchiveProjects.find();
    res.json({ success: true, projects: archivedProjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching archived projects" });
  }
});



const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
