const express = require('express');
const router = express.Router();
const { getMessagesByAppointmentId } = require('../controllers/messageController');

router.get('/:appointmentId', getMessagesByAppointmentId);

module.exports = router;
