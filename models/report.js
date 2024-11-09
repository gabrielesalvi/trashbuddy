const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  location: {
    latitude: Number,
    longitude: Number
  },

  imageUrl: String,      // Salva path locale o URL dell’immagine

  description: String,   // Descrizione facoltativa della segnalazione

  status: { 
    type: String, 
    enum: ['open', 'closed'], // Definisce lo stato della segnalazione
    default: 'open' 
  },

  type: { 
    type: String, 
    enum: ['plastic', 'paper', 'glass', 'organic', 'other', 'hazardous', 'bulky'], // Tipi di rifiuti
  },
  
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('report', reportSchema);
