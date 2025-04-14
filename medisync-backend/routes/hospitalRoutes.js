const express = require("express");
const router = express.Router();
const Equipment = require("../models/Equipment");
const mongoose = require("mongoose");

// GET all equipment
router.get("/equipments", async (req, res) => {
    try {
        console.log("Fetching equipment...");
        
        // Get direct access to the database
        const db = mongoose.connection.db;
        console.log("Current database:", db.databaseName);
        
        // Try both collections
        const equipmentsCollection = db.collection('equipments');
        const equipmentCollection = db.collection('equipment');
        
        // Query both collections
        const equipmentsResult = await equipmentsCollection.find({}).toArray();
        const equipmentResult = await equipmentCollection.find({}).toArray();
        
        console.log("Results from 'equipments' collection:", equipmentsResult.length);
        console.log("Results from 'equipment' collection:", equipmentResult.length);
        
        // Use whichever collection has data
        const equipments = equipmentsResult.length > 0 ? equipmentsResult : equipmentResult;
        
        console.log(`Found ${equipments.length} equipment items`);
        if (equipments.length > 0) {
            console.log("Sample document:", JSON.stringify(equipments[0], null, 2));
        }
        
        res.json(equipments);
    } catch (err) {
        console.error("Error fetching equipment:", err);
        console.error("Error details:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// POST new equipment
router.post("/equipments", async (req, res) => {
    const { name, type, status, hospitalId } = req.body;  // Extract from request body

    const newEquipment = new Equipment({
        name,
        type,
        status,
        hospitalId  // Make sure this exists in the request
    });

    try {
        const savedEquipment = await newEquipment.save();
        res.status(201).json(savedEquipment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;
