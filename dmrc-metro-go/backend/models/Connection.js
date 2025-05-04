const mongoose = require('mongoose');

// Define the Connection Schema
const ConnectionSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    ref: 'Station'
  },
  to: {
    type: String,
    required: true,
    ref: 'Station'
  },
  line: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  }
});

// Create index for efficient path finding
ConnectionSchema.index({ from: 1, to: 1 });
ConnectionSchema.index({ line: 1 });

module.exports = mongoose.model('Connection', ConnectionSchema);