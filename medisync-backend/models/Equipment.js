const mongoose = require("mongoose");

const EquipmentSchema = new mongoose.Schema({
    name: String,
    type: String,
    hospitalId: mongoose.Schema.Types.ObjectId,
    status: String
}, { 
    collection: 'equipments',
    strict: false,
    _id: true // Ensure _id is included
}); 

// Add a pre-find hook to log queries and options
EquipmentSchema.pre('find', function() {
    console.log('Equipment find() query:', JSON.stringify(this.getQuery()));
    console.log('Collection being queried:', this.model.collection.name);
    console.log('Query options:', JSON.stringify(this.getOptions()));
});

const Equipment = mongoose.model("Equipment", EquipmentSchema, 'equipments');

// Ensure indexes are created
Equipment.createIndexes().catch(err => console.error('Index creation error:', err));

module.exports = Equipment;
