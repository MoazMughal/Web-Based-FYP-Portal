const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: String,
  projectDescription: String,
  projectFile: String
});

module.exports = mongoose.model('Project', projectSchema);
