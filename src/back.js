const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const config = require("../src/config/database");
//const Student = require("../src/config/models/students");
//const Teacher = require("../src/config/models/teachers");
//const Coordinator = require("../src/config/models/coordinator");
const {Student,Teacher,Coordinator}=require("../src/mongo")
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
//const bcrypt = require("bcrypt");

const app = express(); // Move the app initialization statement here

// ... (rest of the backend code)


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add 'Authorization' to allowed headers
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



app.post("/studentlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email, password });

    if (student) {
      res.status(200).json({ success: true, message: "Student login successful", studentId: student.id,studentName:student.name });
    } else {
      res.status(401).json({ success: false, message: "Invalid student credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


app.post("/addteacher", async (req, res) => {
  const { teacherId, name, project, email, password } = req.body; // Include teacherId in the request body

  if (!name || !project || !email || !password || !teacherId) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    
    // Check if a teacher with the same email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({ success: false, message: "Teacher with the same email already exists" });
    }

    //console.log("Creating new teacher:", { teacherId, name, project, email, password });
    // Create a new Teacher instance with teacherId
    const newTeacher = new Teacher({ teacherId, name, project, email, password });
    await newTeacher.save();

    //console.log("Teacher added successfully:", newTeacher);
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


const updateTeacherInHome = (teacherId, updatedTeacher) => {
  console.log("Teacher details updated Successfully");
};

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
    // Check if the teacher exists in the database
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Update the teacher's information
    teacher.name = name;
    teacher.project = project;
    teacher.email = email;
    teacher.password = password;
    await teacher.save();

    updateTeacherInHome(teacherId, teacher);
    res.json({ success: true, message: "Teacher details updated successfully" });
  } catch (error) {
    console.error("Error updating teacher details:", error);
    res.status(500).json({ success: false, message: "Failed to update teacher details" });
  }
});


app.delete("/teachers/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Check if the teacher exists in the database
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Delete the teacher from the database using Mongoose's deleteOne method
    await Teacher.deleteOne({ _id: teacherId });

    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: "Failed to delete teacher" });
  }
});



app.post("/teacherlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email, password });

    if (teacher) {
      res.status(200).json({ success: true, message: "Teacher login successful", teacherId: teacher.teacherId, teacherName: teacher.name  });

    } else {
      res.status(401).json({ success: false, message: "Invalid teacher credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// ... (previous code)

// ... (rest of the backend code)



app.post("/coordinatorlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const coordinator = await Coordinator.findOne({ email, password });

    if (coordinator) {
      res.status(200).json({ success: true, message: "Coordinator login successful", Coordinator: coordinator.email });
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
    const existingStudentWithEmail = await Student.findOne({ email });
    const existingStudentWithId = await Student.findOne({ studentId });

    if (existingStudentWithEmail) {
      return res.json("exist"); // User with the same email already exists
    } else if (existingStudentWithId) {
      return res.status(409).json("IDExist"); // User with the same ID already exists
    }

    const newStudent = new Student({ name, studentId, email, password });
    await newStudent.save();

    res.json("notexist");
  } catch (error) {
    console.error("Error registering student:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/check-student-email", async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (student) {
      res.status(200).json({ valid: true }); // Email exists
    } else {
      res.status(200).json({ valid: false }); // Email doesn't exist
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
      res.status(200).json({ valid: true }); // Email exists
    } else {
      res.status(200).json({ valid: false }); // Email doesn't exist
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/verify-code", (req, res) => {
  const { code } = req.body;

  // Assuming the verification code is stored in the database during the /check-email step
  // Replace "hardcodedCode" with the actual verification code stored in your database
  const hardcodedCode = "21324";

  if (code === hardcodedCode) {
    res.status(200).json({ valid: true });
  } else {
    res.status(200).json({ valid: false });
  }
});
const verifyCode = async (email, code) => {
  try {
    // Fetch the stored verification code from the database based on the email
    const teacher = await Teacher.findOne({ email });

    if (teacher && teacher.verificationCode === code) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    return false;
  }
};
app.post("/reset-password", async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  try {
    const user = await Student.findOne({ email }); // Search for the user in Student collection
    let updatedUser;

    if (user) {
      // For students
      updatedUser = await Student.findOneAndUpdate(
        { email },
        { password: newPassword },
        { new: true }
      );
    } else {
      // If not a student, check if it's a teacher
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
