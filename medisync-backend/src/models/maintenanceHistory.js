const mongoose = require('mongoose');

const maintenanceHistorySchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  type: {
    type: String,
    enum: ['preventive', 'corrective', 'emergency'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedAt: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  findings: String,
  actions: String,
  parts: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
  nextMaintenanceDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MaintenanceHistory', maintenanceHistorySchema); 