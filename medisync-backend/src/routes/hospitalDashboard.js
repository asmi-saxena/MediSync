const express = require('express');
const router = express.Router();
const Equipment = require('../models/equipment');
const Ticket = require('../models/ticket');
const MaintenanceHistory = require('../models/maintenanceHistory');

// Get hospital dashboard data
router.get('/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    console.log(`Fetching dashboard data for hospital ${hospitalId}`);

    // Get equipment grouped by department
    const equipmentByDepartment = await Equipment.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$department',
          equipment: {
            $push: {
              _id: '$_id',
              name: '$name',
              serialNumber: '$serialNumber',
              model: '$model',
              manufacturer: '$manufacturer',
              location: '$location',
              status: '$status',
              lastMaintenanceDate: '$lastMaintenanceDate',
              nextMaintenanceDate: '$nextMaintenanceDate'
            }
          },
          totalCount: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get tickets grouped by status
    const ticketsByStatus = await Ticket.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$status',
          tickets: {
            $push: {
              _id: '$_id',
              title: '$title',
              description: '$description',
              priority: '$priority',
              scheduledDate: '$scheduledDate',
              equipment: '$equipment'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'equipment',
          localField: 'tickets.equipment',
          foreignField: '_id',
          as: 'equipmentDetails'
        }
      }
    ]);

    // Get recent maintenance history
    const maintenanceHistory = await MaintenanceHistory.aggregate([
      { 
        $match: {
          equipment: {
            $in: (await Equipment.find({ hospital: hospitalId }).select('_id'))
              .map(eq => eq._id)
          }
        }
      },
      { $sort: { performedAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'equipment',
          localField: 'equipment',
          foreignField: '_id',
          as: 'equipmentDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'performedBy',
          foreignField: '_id',
          as: 'performedByUser'
        }
      },
      {
        $project: {
          _id: 1,
          type: 1,
          description: 1,
          performedAt: 1,
          findings: 1,
          actions: 1,
          nextMaintenanceDate: 1,
          equipment: { $arrayElemAt: ['$equipmentDetails', 0] },
          performedBy: {
            $let: {
              vars: {
                user: { $arrayElemAt: ['$performedByUser', 0] }
              },
              in: {
                _id: '$$user._id',
                name: {
                  $concat: ['$$user.firstName', ' ', '$$user.lastName']
                }
              }
            }
          }
        }
      }
    ]);

    // Get summary statistics
    const stats = {
      totalEquipment: await Equipment.countDocuments({ hospital: hospitalId }),
      activeEquipment: await Equipment.countDocuments({ 
        hospital: hospitalId,
        status: 'active'
      }),
      openTickets: await Ticket.countDocuments({
        hospital: hospitalId,
        status: { $in: ['open', 'in_progress'] }
      }),
      maintenanceDue: await Equipment.countDocuments({
        hospital: hospitalId,
        nextMaintenanceDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // next 30 days
        }
      })
    };

    res.json({
      stats,
      equipmentByDepartment,
      ticketsByStatus,
      maintenanceHistory
    });

  } catch (error) {
    console.error('Error fetching hospital dashboard data:', error);
    res.status(500).json({
      message: 'Failed to fetch hospital dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router; 