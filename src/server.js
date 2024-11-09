const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Report = require('/Users/alessiogandelli/dev/cantiere/trashbuddy_api/models/report.js');

const app = express();
const PORT = process.env.PORT || 1234;

console.log("MONGODB_URI:", process.env.MONGODB_URI);

// Middleware for JSON parsing
app.use(express.json());

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Endpoint to create a report
app.post('/reports', upload.single('image'), async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);

  try {
    const { latitude, longitude, description, status, type } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const report = new Report({
      location: { latitude, longitude },
      imageUrl,
      description,
      status,
      type
    });

    await report.save();

    res.status(201).json({ message: 'Report created!', report });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: 'Error creating report' });
  }
});

// Endpoint to get all reports
app.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
});

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    console.log("Connecting to MongoDB...", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

connectToMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});