const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  location: {
    latitude: Number,
    longitude: Number
  },

  imageUrl: String,      // Salva path locale o URL dell’immagine

  description: String,   // Descrizione facoltativa della segnalazione
  
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('report', reportSchema);
