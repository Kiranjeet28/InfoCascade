const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Notice = require('../models/Notice');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// GET: Admin Login Page
router.get('/login', (req, res) => {
  res.render('admin/login');
});

// POST: Handle Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) return res.send('Admin not found');

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.send('Incorrect password');

  // Save admin in session
  req.session.admin = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    branch: admin.branch,
    year: admin.year
  };

  res.redirect('/admin/dashboard');
});

// GET: Admin Dashboard
router.get('/dashboard', async (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');

  const notices = await Notice.find().sort({ date: -1 });
  const users = await User.find();

  res.render('admin/dashboard', {
    admin: req.session.admin,
    notices,
    users
  });
});

// POST: Handle New Notice Submission
router.post('/post-notice', async (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');

  const { title, content } = req.body;
  const { name, branch, year } = req.session.admin;

  const newNotice = new Notice({
    title,
    message: content,
    date: new Date(),
    postedBy: {
      //name: `${name} (${email})`,
      name,
      branch,
      year
    }
  });

  await newNotice.save();

  // Notify Users via Email
  // const users = await User.find();
  // const emails = users.map(u => u.email);

  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS
  //   }
  // });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: emails,
//     subject: `New Notice: ${title}`,
//     text: `Dear Student,

// ${content}

// Best regards,
// Karan Singh

// `
//   };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) console.error('Email error:', error);
  //   else console.log('Emails sent:', info.response);
  // });

  res.redirect('/admin/dashboard');
});

// DELETE: Delete a notice
router.post('/delete-notice/:id', async (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  await Notice.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
});

// POST: Remove a user
router.post('/remove-user/:id', async (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
});

// GET: Admin Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// GET: Show Edit Notice Form
router.get('/edit-notice/:id', async (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.send('Notice not found');
  res.render('admin/editNotice', { admin: req.session.admin, notice });
});

// POST: Handle Edit Notice Submission
router.post('/edit-notice/:id', async (req, res) => {
  if (!req.session.admin) return res.redirect('/admin/login');
  const { title, content } = req.body;
  await Notice.findByIdAndUpdate(req.params.id, {
    title,
    message: content
  });
  res.redirect('/admin/dashboard');
});

module.exports = router;
