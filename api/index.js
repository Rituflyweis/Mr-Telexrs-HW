require('dotenv').config();
const app = require('../app');
const connectDB = require('../src/config/db');

connectDB();

module.exports = app;
