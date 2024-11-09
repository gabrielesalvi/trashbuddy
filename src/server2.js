const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = 1234;

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Modified POST endpoint to handle multipart form data
app.post('/reports', upload.single('image'), async (req, res) => {
  try {
    const reportData = {
      location: {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude)
      },
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      description: req.body.description || '',
      type: req.body.type || 'other',
      status: 'open',
      address: req.body.address
    };

    const report = new Report(reportData);
    await report.save();
    res.status(201).send(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).send(error);
  }
});