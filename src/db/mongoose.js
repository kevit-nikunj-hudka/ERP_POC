require('dotenv').config
const mongoose = require('mongoose');
const logger = require('../services/logger');

const url = process.env.MONGODB_URL
mongoose.connect(url);
mongoose.connection.on('connected', () => {
    logger.info('DATABASE - Connected');
});

mongoose.connection.on('error', err => {
    logger.error(`DATABASE - Error:${err}`);
});