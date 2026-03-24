// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment-timezone');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public'))); // <- ensure this line exists
app.set('view engine', 'ejs');

// Session middleware
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => console.error('Mongo Error:', err));

// Routes
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use('/admin', adminRoutes); // Admin dashboard
app.use('/', userRoutes);       // Home + subscription

// Timezone configuration
app.locals.formatIST = function(date) {
  return moment(date).tz('Asia/Kolkata').format('DD/MM/YYYY, h:mm:ss a');
};

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});

// parse incoming JSON and form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple request logger for debugging deployed requests
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url, req.body && Object.keys(req.body).length ? req.body : '');
  next();
});
