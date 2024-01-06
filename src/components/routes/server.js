// server.js
const express = require('express');
const mongoose = require('mongoose');
const Student = require('.Student'); // Import the Student model

const app = express();
const port = 3000;

// Middleware for parsing JSON data
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fypdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Student Signup route
app.post('/students', async (req, res) => {
  try {
    const { studentName, studentId, studentEmail, studentPassword } = req.body;

    // Create a new student
    const newStudent = new Student({
      studentName,
      studentId,
      studentEmail,
      studentPassword
    });

    // Save the student to the database
    const savedStudent = await newStudent.save();

    res.status(200).json(savedStudent);
  } catch (error) {
    console.error('Error signing up student:', error);
    res.status(500).json({ error: 'An error occurred while signing up student.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
