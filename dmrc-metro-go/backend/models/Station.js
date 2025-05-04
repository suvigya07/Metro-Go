const mongoose = require('mongoose');

// Define the Station Schema
const StationSchema = new mongoose.Schema({
  stationId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  lines: [{
    type: String,
    required: true
  }],
  distanceFromFirst: {
    type: Number,
    default: 0
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  opened: {
    type: String
  },
  layout: {
    type: String
  }
});

// Create a compound index on name and line for efficient lookups
StationSchema.index({ name: 1, 'lines.0': 1 });

module.exports = mongoose.model('Station', StationSchema);