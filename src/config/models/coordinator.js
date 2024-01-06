const mongoose = require("mongoose");
const coordinatorSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  });
  const Coordinator = mongoose.model("Coordinators", coordinatorSchema);
  module.exports = Coordinator;