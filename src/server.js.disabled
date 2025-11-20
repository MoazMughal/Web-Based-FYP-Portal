const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 7000;

app.use(cors());
app.use(express.json());

// Sample data for requests
const requests = [];

// GET /requests - Fetch all requests
app.get("/requests", (req, res) => {
  res.json({ success: true, requests });
});

// POST /requests - Create a new request
app.post("/requests", (req, res) => {
  const { email, projectName } = req.body;

  // Perform the request creation logic here
  const request = {
    id: requests.length + 1,
    studentName: email,
    projectName: `Project ${projectName}`,
  };

  requests.push(request);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
