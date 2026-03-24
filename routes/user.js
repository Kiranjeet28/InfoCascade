const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Notice = require('../models/Notice');
const User = require('../models/User');

// create transporter once (will use env vars on Render)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Home page showing latest notices + subscription form
router.get('/', async (req, res) => {
  const notices = await Notice.find().sort({ date: -1 });
  res.render('user/home', { notices });
});

// Handle form submission
router.post('/subscribe', async (req, res) => {
  const { name, email, branch, year } = req.body;

  // Avoid duplicate email
  const existing = await User.findOne({ email });
  if (existing) return res.send('You are already subscribed.');

  const user = new User({ name, email, branch, year });
  await user.save();
  res.send('Subscription successful! You will receive notice updates via email.');
});

// Contact form POST
router.post('/contact', async (req, res) => {
  console.log('[/contact] body:', req.body);
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'infocascade.gndec@gmail.com',
      subject: `infocascade query from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[/contact] mail sent:', info && info.response ? info.response : info);
    return res.json({ ok: true, message: 'Your message has been sent to the admin.' });
  } catch (err) {
    console.error('[/contact] send error:', err);
    return res.status(500).json({ error: 'Unable to send message at this time.' });
  }
});

module.exports = router;




