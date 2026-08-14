const express = require('express');
const router = express.Router();
const { getPendingDoctors, approveDoctor, rejectDoctor } = require('../controllers/adminController');

router.get('/pending-doctors', getPendingDoctors);
router.put('/approve-doctor/:id', approveDoctor);
router.put('/reject-doctor/:id', rejectDoctor);

module.exports = router;
