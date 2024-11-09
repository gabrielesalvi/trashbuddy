const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Report = require('./report.js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = 1234;

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Improved file filter with proper MIME type checking
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only jpeg, png, gif, and webp images are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 5MB limit
        files: 1 // Only allow 1 file per request
    },
    fileFilter: fileFilter
});

// Middleware
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Create a new report with image
app.post('/reports', (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // Handle Multer errors
            return res.status(400).json({
                error: 'Upload error',
                details: err.message
            });
        } else if (err) {
            // Handle other errors
            return res.status(500).json({
                error: 'Server error',
                details: err.message
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'No image file provided'
                });
            }

            const reportData = {
                location: {
                    latitude: parseFloat(req.body.latitude),
                    longitude: parseFloat(req.body.longitude)
                },
                address: req.body.address,
                imageUrl: `/uploads/${req.file.filename}`,
                description: req.body.description || '',
                type: req.body.type || 'other',
                status: 'open'
            };

            console.log('Creating report:', reportData);

            const report = new Report(reportData);
            await report.save();
            res.status(201).json(report);
        } catch (error) {
            // Clean up uploaded file if database save fails
            if (req.file) {
                fs.unlink(req.file.path, (unlinkError) => {
                    if (unlinkError) console.error('Error deleting file:', unlinkError);
                });
            }
            res.status(400).json({
                error: 'Failed to create report',
                details: error.message
            });
        }
    });
});

// Get all reports
// Get all reports
app.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ timestamp: -1 });
        
        // Transform reports to include full image URLs
        const reportsWithImages = reports.map(report => {
            const reportObj = report.toObject();
            // Convert relative image path to full URL
            if (reportObj.imageUrl) {
                reportObj.imageUrl = `${req.protocol}://${req.get('host')}${reportObj.imageUrl}`;
            }
            return reportObj;
        });

        res.status(200).json(reportsWithImages);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch reports',
            details: error.message
        });
    }
});

// Get a single report's image
app.get('/uploads/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path.join(__dirname, 'uploads', filename);
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({
                error: 'Image not found'
            });
        }
        
        // Send the image file
        res.sendFile(imagePath);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch image',
            details: error.message
        });
    }
});

// Get a single report by ID
app.get('/reports/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({
                error: 'Report not found'
            });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch report',
            details: error.message
        });
    }
});

// Delete a report by ID
app.delete('/reports/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({
                error: 'Report not found'
            });
        }

        // Delete image file if it exists
        if (report.imageUrl) {
            const imagePath = path.join(__dirname, report.imageUrl);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting image file:', err);
            });
        }

        await report.deleteOne();
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete report',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        details: error.message
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});