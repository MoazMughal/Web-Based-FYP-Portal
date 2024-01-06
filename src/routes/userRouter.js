const express = require("express");
const router = express.Router();
const Student = require("../config/models/students");
const Teacher = require("../config/models/teachers");
const Coordinator = require("../config/models/coordinator");
//const checkUserAuth = require("../middleware/auth");
const back=require("../back")

router.post("/studentlogin", async (req, res) => {
  // ... (your existing student login route implementation)
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email, password });

    if (student) {
      res.status(200).json({ success: true, message: "Student login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid student credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/addteacher",  async (req, res) => {
  // ... (your existing add teacher route implementation)
  const { name, project, email, password } = req.body;

  // Check if all required fields are provided and not empty
  if (!name || !project || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if the teacher with the same email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(409).json({ success: false, message: "Teacher with the same email already exists" });
    }

    // If teacher with the email does not exist, create a new teacher
    const newTeacher = new Teacher({ name, project, email, password });
    await newTeacher.save();

    // Generate a JWT token for the new teacher using the teacher's MongoDB _id

    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      teacher: newTeacher,
      token: token,
    });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/teachers", async (req, res) => {
  // ... (your existing get teachers route implementation)
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/teachers/:id", async (req, res) => {
  // ... (your existing update teacher route implementation)
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

router.delete("/teachers/:id", async (req, res) => {
  // ... (your existing delete teacher route implementation)
  try {
    const teacherId = req.params.id;

    // Check if the teacher exists in the database
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Delete the teacher from the database
    await Teacher.findByIdAndDelete(teacherId);

    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ success: false, message: "Failed to delete teacher" });
  }
});

router.post("/teacherlogin", async (req, res) => {
  // ... (your existing teacher login route implementation)
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email, password });

    if (teacher) {
      // Generate a JWT token for the teacher using the teacher's MongoDB _id
     
      res.status(200).json({
        success: true,
        message: "Teacher login successful",
        token: token, // Include the token in the response
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid teacher credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


router.post("/coordinatorlogin", async (req, res) => {
  // ... (your existing coordinator login route implementation)
  const { email, password } = req.body;

  try {
    const coordinator = await Coordinator.findOne({ email, password });

    if (coordinator) {
      res.status(200).json({ success: true, message: "Coordinator login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid coordinator credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/signup", async (req, res) => {
  // ... (your existing user signup route implementation)
  const { userType, name, id, email, password } = req.body;

  let userModel;

  if (userType === "student") {
    userModel = Student;
  } else if (userType === "teacher") {
    userModel = Teacher;
  } else if (userType === "coordinator") {
    userModel = Coordinator;
  }

  if (!userModel) {
    res.status(400).json({ success: false, message: "Invalid user type" });
    return;
  }

  try {
    const check = await userModel.findOne({ email });

    if (check) {
      res.json("exist");
    } else {
      res.json("notexist");
      await userModel.create({ name, id, email, password });
    }
  } catch (e) {
    res.json("fail");
  }
});

module.exports = router;
