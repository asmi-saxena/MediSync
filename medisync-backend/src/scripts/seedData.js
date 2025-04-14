const mongoose = require('mongoose');
const Equipment = require('../models/equipment');
const Hospital = require('../models/hospital');
const Ticket = require('../models/ticket');
const MaintenanceHistory = require('../models/maintenanceHistory');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/medisync', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedData = async () => {
  try {
    // Clear existing data
    await Promise.all([
      Equipment.deleteMany({}),
      Hospital.deleteMany({}),
      Ticket.deleteMany({}),
      MaintenanceHistory.deleteMany({})
    ]);

    console.log('Existing data cleared');

    // Create a hospital
    const hospital = await Hospital.create({
      name: 'Central Hospital',
      address: '123 Medical Center Blvd',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      phone: '217-555-0123',
      email: 'admin@centralhospital.com',
      status: 'active'
    });

    console.log('Hospital created');

    // Create some equipment
    const equipment = await Equipment.create([
      {
        name: 'X-Ray Machine',
        serialNumber: 'XR2024001',
        model: 'XR-2000',
        manufacturer: 'MediTech',
        hospital: hospital._id,
        department: 'Radiology',
        location: 'Room 101',
        status: 'active',
        purchaseDate: new Date('2023-01-15'),
        lastMaintenanceDate: new Date('2024-01-15'),
        nextMaintenanceDate: new Date('2024-04-15'),
        maintenanceFrequency: 90, // days
        notes: 'Primary X-Ray machine for emergency department'
      },
      {
        name: 'MRI Scanner',
        serialNumber: 'MRI2024001',
        model: 'MRI-3T',
        manufacturer: 'ImagingTech',
        hospital: hospital._id,
        department: 'Radiology',
        location: 'Room 201',
        status: 'active',
        purchaseDate: new Date('2023-02-20'),
        lastMaintenanceDate: new Date('2024-02-20'),
        nextMaintenanceDate: new Date('2024-05-20'),
        maintenanceFrequency: 90, // days
        notes: 'High-field MRI scanner'
      }
    ]);

    console.log('Equipment created');

    // Create some tickets
    const tickets = await Ticket.create([
      {
        title: 'Routine Maintenance - X-Ray Machine',
        description: 'Scheduled quarterly maintenance check',
        equipment: equipment[0]._id,
        hospital: hospital._id,
        priority: 'medium',
        status: 'open',
        scheduledDate: new Date('2024-04-15'),
        createdBy: '65e1f2f6c64d6d001c1c0f01' // Default admin user ID
      },
      {
        title: 'MRI Scanner Calibration',
        description: 'Regular calibration required',
        equipment: equipment[1]._id,
        hospital: hospital._id,
        priority: 'high',
        status: 'in_progress',
        scheduledDate: new Date('2024-03-25'),
        createdBy: '65e1f2f6c64d6d001c1c0f01' // Default admin user ID
      }
    ]);

    console.log('Tickets created');

    // Create maintenance history
    await MaintenanceHistory.create([
      {
        equipment: equipment[0]._id,
        ticket: tickets[0]._id,
        type: 'preventive',
        description: 'Quarterly maintenance check',
        performedAt: new Date('2024-01-15'),
        findings: 'All systems operating within normal parameters',
        actions: 'Cleaned components, calibrated sensors',
        nextMaintenanceDate: new Date('2024-04-15'),
        performedBy: '65e1f2f6c64d6d001c1c0f01' // Default admin user ID
      },
      {
        equipment: equipment[1]._id,
        ticket: tickets[1]._id,
        type: 'preventive',
        description: 'Regular maintenance',
        performedAt: new Date('2024-02-20'),
        findings: 'Minor adjustments needed',
        actions: 'Calibrated magnetic field, updated software',
        nextMaintenanceDate: new Date('2024-05-20'),
        performedBy: '65e1f2f6c64d6d001c1c0f01' // Default admin user ID
      }
    ]);

    console.log('Maintenance history created');

    console.log('Sample data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 