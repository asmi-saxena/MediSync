const express = require('express');
const router = express.Router();
const Hospital = require('../models/hospital');
const Equipment = require('../models/equipment');

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all hospitals...');
    const hospitals = await Hospital.find().populate('adminUser', 'firstName lastName email');
    
    // Get equipment counts for each hospital
    const hospitalsWithCounts = await Promise.all(hospitals.map(async (hospital) => {
      const hospitalObj = hospital.toObject();
      
      // Count total equipment
      const totalEquipment = await Equipment.countDocuments({ hospital: hospital._id });
      hospitalObj.equipmentCount = totalEquipment;
      
      // Count active equipment
      const activeEquipment = await Equipment.countDocuments({ 
        hospital: hospital._id,
        status: 'active'
      });
      hospitalObj.activeEquipmentCount = activeEquipment;
      
      return hospitalObj;
    }));
    
    console.log(`Found ${hospitalsWithCounts.length} hospitals`);
    res.json(hospitalsWithCounts);
  } catch (err) {
    console.error('Error fetching hospitals:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get single hospital
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('adminUser', 'firstName lastName email');
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    // Get equipment counts
    const hospitalObj = hospital.toObject();
    hospitalObj.equipmentCount = await Equipment.countDocuments({ hospital: hospital._id });
    hospitalObj.activeEquipmentCount = await Equipment.countDocuments({ 
      hospital: hospital._id,
      status: 'active'
    });
    
    res.json(hospitalObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create hospital
router.post('/', async (req, res) => {
  const hospital = new Hospital(req.body);
  try {
    const newHospital = await hospital.save();
    res.status(201).json(newHospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update hospital
router.patch('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete hospital
router.delete('/:id', async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hospital deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 