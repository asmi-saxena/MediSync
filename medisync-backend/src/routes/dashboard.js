const express = require('express');
const router = express.Router();
const Equipment = require('../models/equipment');
const Ticket = require('../models/ticket');
const MaintenanceHistory = require('../models/maintenanceHistory');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching dashboard statistics...');

    // Debug log for models
    console.log('Models loaded:', {
      Equipment: !!Equipment,
      Ticket: !!Ticket,
      MaintenanceHistory: !!MaintenanceHistory
    });

    // Get total equipment count
    console.log('Fetching total equipment count...');
    const allEquipment = await Equipment.find();
    const totalEquipment = allEquipment.length;
    console.log('All equipment:', allEquipment.map(e => ({
      id: e._id,
      name: e.name,
      status: e.status,
      hospital: e.hospital
    })));
    console.log('Total equipment:', totalEquipment);
    
    // Get active equipment count
    console.log('Fetching active equipment count...');
    const activeEquipmentList = await Equipment.find({ status: 'active' });
    const activeEquipment = activeEquipmentList.length;
    console.log('Active equipment:', activeEquipmentList.map(e => ({
      id: e._id,
      name: e.name,
      status: e.status,
      hospital: e.hospital
    })));
    console.log('Active equipment count:', activeEquipment);
    
    // Get equipment due for maintenance
    console.log('Fetching maintenance due count...');
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const maintenanceDueList = await Equipment.find({
      nextMaintenanceDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    });
    const maintenanceDue = maintenanceDueList.length;
    console.log('Maintenance due equipment:', maintenanceDueList.map(e => ({
      id: e._id,
      name: e.name,
      nextMaintenanceDate: e.nextMaintenanceDate,
      hospital: e.hospital
    })));
    console.log('Maintenance due count:', maintenanceDue);
    
    // Get open tickets count
    console.log('Fetching open tickets count...');
    const openTicketsList = await Ticket.find({ 
      status: { $in: ['open', 'in_progress'] }
    });
    const openTickets = openTicketsList.length;
    console.log('Open tickets:', openTicketsList.map(t => ({
      id: t._id,
      title: t.title,
      status: t.status,
      equipment: t.equipment
    })));
    console.log('Open tickets count:', openTickets);

    // Get recent activities
    console.log('Fetching recent activities...');
    const recentActivities = await Promise.all([
      // Recent tickets
      Ticket.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('equipment', 'name')
        .populate('createdBy', 'firstName lastName')
        .lean()
        .then(tickets => tickets.map(ticket => ({
          id: ticket._id,
          type: 'ticket',
          description: `New ticket: ${ticket.title}`,
          equipment: ticket.equipment?.name || 'Unknown Equipment',
          user: ticket.createdBy ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}` : 'Unknown User',
          timestamp: ticket.createdAt
        }))),
      
      // Recent maintenance records
      MaintenanceHistory.find()
        .sort({ performedAt: -1 })
        .limit(5)
        .populate('equipment', 'name')
        .populate('performedBy', 'firstName lastName')
        .lean()
        .then(records => records.map(record => ({
          id: record._id,
          type: 'maintenance',
          description: `Maintenance performed: ${record.description}`,
          equipment: record.equipment?.name || 'Unknown Equipment',
          user: record.performedBy ? `${record.performedBy.firstName} ${record.performedBy.lastName}` : 'Unknown User',
          timestamp: record.performedAt
        })))
    ]).then(([tickets, maintenance]) => {
      // Combine and sort by timestamp
      return [...tickets, ...maintenance]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    });

    console.log('Recent activities count:', recentActivities.length);

    const response = {
      stats: {
        totalEquipment,
        activeEquipment,
        maintenanceDue,
        openTickets
      },
      recentActivities
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('Error in dashboard stats:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router; 