const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "fullName is required"],
    trim: true,
  },
  course: {
    type: String,
    required: [true, "course is required"],
    trim: true,
  },
  yearLevel: {
    type: Number,
    required: [true, "yearLevel is required"],
    min: [1, "yearLevel must be between 1 and 4"],
    max: [4, "yearLevel must be between 1 and 4"],
  },
  section: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Student", studentSchema);