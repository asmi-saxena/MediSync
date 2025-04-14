const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('../models/hospital');
const Equipment = require('../models/equipment');
const User = require('../models/user');
const Ticket = require('../models/ticket');

// Load environment variables
dotenv.config();

async function seedAll() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medisync');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Hospital.deleteMany({});
    await Equipment.deleteMany({});
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Create a hospital
    console.log('Creating hospital...');
    const hospital = await Hospital.create({
      name: 'General Hospital',
      address: '123 Medical Drive',
      city: 'Medical City',
      state: 'MC',
      zipCode: '12345',
      phone: '555-0123',
      email: 'info@generalhospital.com',
      status: 'active'
    });
    console.log('Hospital created:', hospital.name);

    // Create a super admin user
    console.log('Creating super admin user...');
    const user = await User.create({
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123',
      phone: '555-0100',
      role: 'super_admin',
      status: 'active'
    });
    console.log('User created:', user.email);

    // Create equipment
    console.log('Creating equipment...');
    const equipment = await Equipment.create({
      name: 'MRI Scanner',
      serialNumber: 'MRI001',
      model: 'Siemens Magnetom',
      manufacturer: 'Siemens',
      department: 'Radiology',
      location: 'Room 101',
      status: 'active',
      hospital: hospital._id,
      purchaseDate: new Date('2023-01-01'),
      lastMaintenanceDate: new Date('2024-01-01'),
      nextMaintenanceDate: new Date('2024-04-01'),
      maintenanceFrequency: 90, // days
      notes: 'High-performance MRI scanner'
    });
    console.log('Equipment created:', equipment.name);

    // Create sample tickets
    console.log('Creating tickets...');
    const tickets = await Ticket.insertMany([
      {
        title: 'Regular Maintenance - MRI Scanner',
        description: 'Scheduled maintenance check for MRI Scanner',
        equipment: equipment._id,
        hospital: hospital._id,
        priority: 'medium',
        status: 'open',
        createdBy: user._id,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: [{
          text: 'Initial inspection scheduled',
          addedBy: user._id
        }]
      },
      {
        title: 'Urgent Repair - MRI Scanner',
        description: 'MRI showing error code E123',
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
      }
    ]);
    console.log(`Created ${tickets.length} tickets`);

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedAll(); 