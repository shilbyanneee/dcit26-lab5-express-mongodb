require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: para mabasa ang JSON request body
app.use(express.json());

// Helpers
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const pickStudentFields = (body) => {
  const allowed = ["fullName", "course", "yearLevel", "section"];
  const data = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
};

// Health route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

// GET all students
app.get("/api/students", async (req, res, next) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    next(err);
  }
});

// GET one student
app.get("/api/students/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json(student);
  } catch (err) {
    next(err);
  }
});

// POST create student
app.post("/api/students", async (req, res, next) => {
  try {
    const student = await Student.create(pickStudentFields(req.body));
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
});

// PUT update student
app.put("/api/students/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      pickStudentFields(req.body),
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE student
app.delete("/api/students/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully", student: deleted });
  } catch (err) {
    next(err);
  }
});

// 404 para sa unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler (walang stack trace na ipapadala sa client)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON body" });
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: "Validation failed", details: messages });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid value for field: " + err.path });
  }
  console.error(err); // sa terminal lang, hindi sa client
  res.status(500).json({ error: "Internal server error" });
});

// Connect muna sa MongoDB bago mag-listen
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });