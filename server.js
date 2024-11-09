const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Report = require('./models/report');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware per parsing del JSON, applicato prima di altre rotte
app.use(express.json());  // JSON middleware prima delle rotte

// Configurazione multer per l'upload delle immagini
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Endpoint per creare una segnalazione
app.post('/reports', upload.single('image'), async (req, res) => {

  console.log("Body della richiesta:", req.body);  // Log dei dati JSON
  console.log("File caricato:", req.file);        // Log del file caricato (se presente)
  
  try {
    const { latitude, longitude, description, status, type } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    // Crea e salva la segnalazione
    const report = new Report({
      location: { latitude, longitude },
      imageUrl,
      description,
      status,
      type
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
    const reports = await Report.find();  // Usa il nome corretto del modello 'Report'
    res.status(200).json(reports);
  } catch (error) {
    console.error("Errore nel recupero delle segnalazioni:", error);
    res.status(500).json({ error: 'Errore nel recupero delle segnalazioni' });
  }
});

// Connessione a MongoDB
mongoose.connect('mongodb://localhost:27017/trashbuddy_api', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connesso a MongoDB"))
  .catch((err) => console.error("Errore di connessione a MongoDB:", err));

app.listen(PORT, () => {
  console.log(`Server è in esecuzione sulla porta ${PORT}`);
});

