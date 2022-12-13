// Modules
const jwt = require('jsonwebtoken');
const Users = require('../models/users');
const logger = require('../services/logger');

// Authentication function to work with tokens
const auth = async function (req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'secretkey');
        const user = await Users.findOne({
            _id: decoded._id,
            'tokens.token': token
        });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (Error) {
        res.status(401).send({ Error: 'Please authenticate.' });
        logger.error(Error.message)
    }
}

// Export Authenticaion Module
module.exports = auth;