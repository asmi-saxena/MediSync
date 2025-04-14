const express = require('express');
const router = express.Router();
const MaintenanceHistory = require('../models/maintenanceHistory');

// Get all maintenance history
router.get('/', async (req, res) => {
  try {
    const history = await MaintenanceHistory.find()
      .populate('equipment', 'name serialNumber')
      .populate('ticket', 'title')
      .populate('performedBy', 'firstName lastName')
      .sort({ performedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single maintenance record
router.get('/:id', async (req, res) => {
  try {
    const record = await MaintenanceHistory.findById(req.params.id)
      .populate('equipment', 'name serialNumber')
      .populate('ticket', 'title')
      .populate('performedBy', 'firstName lastName');
    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create maintenance record
router.post('/', async (req, res) => {
  const record = new MaintenanceHistory(req.body);
  try {
    const newRecord = await record.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update maintenance record
router.patch('/:id', async (req, res) => {
  try {
    const record = await MaintenanceHistory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete maintenance record
router.delete('/:id', async (req, res) => {
  try {
    await MaintenanceHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Maintenance record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 