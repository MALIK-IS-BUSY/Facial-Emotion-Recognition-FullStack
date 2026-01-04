const express = require('express');
const Newsletter = require('../models/Newsletter');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @route   POST /api/newsletter
// @desc    Subscribe to newsletter
router.post('/', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    const newsletter = await Newsletter.create({ email });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      newsletter
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

