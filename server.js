const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Report = require('./models/report');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB configuration
mongoose.connect('mongodb://localhost:27017/trashbuddy_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connesso a MongoDB"))
.catch((err) => console.error("Errore di connessione a MongoDB:", err));

// multer image uploader configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware per parsing del JSON
app.use(express.json());

// Endpoint per creare una segnalazione
app.post('/reports', upload.single('image'), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    // const imageUrl = req.file ? req.file.path : null;

    // Crea e salva la segnalazione
    const report = new Report({
      location: { latitude, longitude },
      // imageUrl
    });

    await report.save();

    res.status(201).json({ message: 'Segnalazione creata!', report });
  } catch (error) {
    console.error("Errore nella creazione della segnalazione:", error);
    res.status(500).json({ error: 'Errore nella creazione della segnalazione' });
  }
});

// Endpoint per ottenere tutte le segnalazioni
app.get('/reports', async (req, res) => {
  try {
    const reports = await report.find();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Errore nel recupero delle segnalazioni:", error);
    res.status(500).json({ error: 'Errore nel recupero delle segnalazioni' });
  }
});

app.listen(3000, () => {
  console.log(`Server avviato su http://localhost:3000`);
});
