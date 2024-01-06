const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fyp-portal', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Create a schema for the project
const projectSchema = new mongoose.Schema({
  projectName: String,
  projectDescription: String,
  projectFile: String
});

// Create a model for the project
const Project = mongoose.model('Project', projectSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// Enable CORS
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle file uploads
app.post('/api/upload', upload.single('projectFile'), (req, res) => {
  const { projectName, projectDescription } = req.body;
  const projectFile = req.file.filename;

  const project = new Project({ projectName, projectDescription, projectFile });

  project.save()
    .then(() => res.json({ message: 'Project uploaded successfully.' }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));
