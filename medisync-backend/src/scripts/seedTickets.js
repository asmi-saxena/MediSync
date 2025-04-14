const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Equipment = require('../models/equipment');
const Hospital = require('../models/hospital');
const User = require('../models/user');
const Ticket = require('../models/ticket');

// Load environment variables
dotenv.config();

async function seedTickets() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medisync');
    console.log('Connected to MongoDB');

    // Get a hospital
    const hospital = await Hospital.findOne();
    if (!hospital) {
      throw new Error('No hospital found. Please seed hospitals first.');
    }

    // Get some equipment
    const equipment = await Equipment.findOne();
    if (!equipment) {
      throw new Error('No equipment found. Please seed equipment first.');
    }

    // Get a user (for createdBy)
    const user = await User.findOne();
    if (!user) {
      throw new Error('No user found. Please seed users first.');
    }

    // Delete existing tickets
    console.log('Deleting existing tickets...');
    await Ticket.deleteMany({});

    // Create sample tickets
    const sampleTickets = [
      {
        title: 'Regular Maintenance - MRI Scanner',
        description: 'Scheduled maintenance check for MRI Scanner',
        equipment: equipment._id,
        hospital: hospital._id,
        priority: 'medium',
        status: 'open',
        createdBy: user._id,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: [{
          text: 'Initial inspection scheduled',
          addedBy: user._id
        }]
      },
      {
        title: 'Urgent Repair - X-Ray Machine',
        description: 'X-Ray machine showing error code E123',
        equipment: equipment._id,
        hospital: hospital._id,
        priority: 'high',
        status: 'in_progress',
        createdBy: user._id,
        assignedTo: user._id,
        scheduledDate: new Date(),
        notes: [{
          text: 'Technician assigned for immediate inspection',
          addedBy: user._id
        }]
      },
      {
        title: 'Calibration Required',
        description: 'Annual calibration due for ultrasound equipment',
        equipment: equipment._id,
        hospital: hospital._id,
        priority: 'low',
        status: 'open',
        createdBy: user._id,
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        notes: [{
          text: 'Scheduled for next maintenance window',
          addedBy: user._id
        }]
      }
    ];

    console.log('Creating sample tickets...');
    const createdTickets = await Ticket.insertMany(sampleTickets);
    console.log(`Created ${createdTickets.length} sample tickets`);

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding tickets:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedTickets(); 