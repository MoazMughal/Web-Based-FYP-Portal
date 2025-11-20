// auth.js

const jwt = require('jsonwebtoken');
const Teacher = require('../config/models/teachers');
const checkUserAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from request headers

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication token not provided" });
  }

  try {
    // Verify the JWT token using the same JWT_SECRET_KEY that was used to sign the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    req.teacherId = decodedToken.teacherId; // Save the teacher ID to the request object for later use
    console.log(decodedToken.teacherId);
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};


module.exports = checkUserAuth;
