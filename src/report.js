const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  location: {
    latitude: Number,
    longitude: Number
  },
  imageUrl: String,
  description: String,
  status: { 
    type: String, 
    enum: ['open', 'closed'],
    default: 'open' 
  },
  type: { 
    type: String, 
  },
  address: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('report', reportSchema);
