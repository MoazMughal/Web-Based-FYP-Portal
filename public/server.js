// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// configure CORS
app.use(cors());

// connect to MongoDB
mongoose.connect("mongodb://localhost:27017/web-fyp-portal", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// create a project schema
const projectSchema = new mongoose.Schema({
  projectName: String,
  projectTitle: String,
  projectDescription: String,
  projectFileUrl: String,
});

// create a project model
const Project = mongoose.model("Project", projectSchema);
// handle file uploads
app.post("/uploads", upload.single("projectFile"), (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).send({ message: "No file uploaded" });
  } else {
    res.send({ fileUrl: `/uploads/${file.originalname}` });
  }
});

// handle project submissions
app.post("/projects", async (req, res) => {
  const projectName = req.body.projectName;
  const projectTitle = req.body.projectTitle;
  const projectDescription = req.body.projectDescription;
  const projectFileUrl = req.body.projectFileUrl;

  try {
    const project = new Project({
      projectName: projectName,
      projectTitle: projectTitle,
      projectDescription: projectDescription,
      projectFileUrl: projectFileUrl,
    });
    await project.save();
  
    res.send({ message: "Project saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
