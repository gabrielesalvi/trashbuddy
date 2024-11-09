const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Report = require('/Users/alessiogandelli/dev/cantiere/trashbuddy_api/models/report.js');

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })


const app = express();
const port = 1234;

app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Create a new report
app.post('/reports', async (req, res) => {
    console.log("Request body:", req.body);
    try {
        const report = new Report(req.body);
        console.log("Report:", report);
        await report.save();
        res.status(201).send(report);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Read all reports
app.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).send(reports);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read a single report by ID
app.get('/reports/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).send();
        }
        res.status(200).send(report);
    } catch (error) {
        res.status(500).send(error);
    }
});



// Delete a report by ID
app.delete('/reports/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).send();
        }
        res.status(200).send(report);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});