const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket');

// Get all tickets
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/tickets - Fetching all tickets');
    console.log('Request query:', req.query);

    // Check if MongoDB is connected
    if (!Ticket.db.readyState) {
      console.error('MongoDB not connected. Ready state:', Ticket.db.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Log the current user making the request
    console.log('User making request:', req.user);

    // First, just count the tickets
    const ticketCount = await Ticket.countDocuments();
    console.log('Total ticket count:', ticketCount);

    // Then try to fetch them
    const tickets = await Ticket.find()
      .populate('equipment', 'name serialNumber')
      .populate('hospital', 'name')
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log(`Successfully fetched ${tickets.length} tickets`);
    console.log('Sample ticket:', tickets[0]);

    res.json(tickets);
  } catch (err) {
    console.error('Error in GET /api/tickets:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Failed to fetch tickets',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/tickets/${req.params.id} - Fetching single ticket`);
    
    const ticket = await Ticket.findById(req.params.id)
      .populate('equipment', 'name serialNumber')
      .populate('hospital', 'name')
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('notes.addedBy', 'firstName lastName');
    
    if (!ticket) {
      console.log(`Ticket with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    console.log(`Ticket found: ${ticket.title}`);
    res.json(ticket);
  } catch (err) {
    console.error(`Error fetching ticket ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/tickets - Creating new ticket');
    console.log('Request body:', req.body);
    
    const ticket = new Ticket(req.body);
    const newTicket = await ticket.save();
    
    console.log(`Ticket created with ID: ${newTicket._id}`);
    res.status(201).json(newTicket);
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update ticket
router.patch('/:id', async (req, res) => {
  try {
    console.log(`PATCH /api/tickets/${req.params.id} - Updating ticket`);
    console.log('Update data:', req.body);
    
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!ticket) {
      console.log(`Ticket with ID ${req.params.id} not found for update`);
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    console.log(`Ticket updated: ${ticket.title}`);
    res.json(ticket);
  } catch (err) {
    console.error(`Error updating ticket ${req.params.id}:`, err);
    res.status(400).json({ message: err.message });
  }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    console.log(`DELETE /api/tickets/${req.params.id} - Deleting ticket`);
    
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      console.log(`Ticket with ID ${req.params.id} not found for deletion`);
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    console.log(`Ticket deleted: ${ticket.title}`);
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    console.error(`Error deleting ticket ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Add note to ticket
router.post('/:id/notes', async (req, res) => {
  try {
    console.log(`POST /api/tickets/${req.params.id}/notes - Adding note to ticket`);
    console.log('Note data:', req.body);
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      console.log(`Ticket with ID ${req.params.id} not found for adding note`);
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    ticket.notes.push(req.body);
    await ticket.save();
    
    console.log(`Note added to ticket: ${ticket.title}`);
    res.json(ticket);
  } catch (err) {
    console.error(`Error adding note to ticket ${req.params.id}:`, err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 