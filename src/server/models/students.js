// student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true,
    unique: true
  },
  studentPassword: {
    type: String,
    required: true
  }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
