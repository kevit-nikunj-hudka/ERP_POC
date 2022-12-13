// Modules
const express = require('express');
const Users = require('../models/users');
const auth = require('../middleware/auth');
const logger = require('../services/logger');
const router = new express.Router();

// POST METHOD - CREATE
// Add admin with role
router.post('/admin', async function (req, res) {

    const user = new Users(req.body);
    const isAdmin = await Users.findOne({ role: 'admin' });
    if (isAdmin !== null) {

        throw new Error();
    }

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    }
    catch (e) {
        res.status(400).send('Admin already exists!');
        logger.error(e.message)
    }
})

// POST METHOD - CREATE
// Add staff with role
router.post('/staff', auth, async function (req, res) {

    if (req.user.role !== 'admin') {
        res.status(400).send('Login as admin.')
    }
    const user = new Users(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    }
    catch (e) {
        res.status(400).send();
        logger.error(e.message)
    }
})

// POST METHOD - LOGIN
// Login the user when it's created with authentication
router.post('/staff/login', async function (req, res) {
    try {
        const user = await Users.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        const status = `${user.name}, you are logged in.`
        res.send({ status, user, token })
    } catch (e) {
        res.status(400).send(e);
        logger.error(e.message)
    }
})


// Get user's profile data using GET method and authentication token
router.get('/staff/data', auth, async (req, res) => {

    // Read staff only if admin is logged in
    if (req.user.role === 'admin') {
        const staff = await Users.find({ role: 'faculty' })
        res.send(staff);
    }
})

// POST METHOD - LOGOUT
// Logout the user with authentication token
router.post('/staff/logout', auth, async function (req, res) {
    try {

        // Check token exists or not and then delete it
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();

        res.send('Logged Out!')
    } catch (e) {
        res.status(500).send();
        logger.error(e.message)
    }
})

// POST METHOD - LOGOUT ALL SESSIONS
// Logout the user with authentication token
router.post('/staff/logoutAll', auth, async function (req, res) {
    try {

        // delete every token by emptyng array
        req.user.tokens = [];
        await req.user.save();
        res.send('Logged Out!');

    } catch (e) {
        res.status(500).send();
        logger.error(e.message)
    }
})


// PATCH METHOD - UPDATE PASSWORD
// Can update password only because other details will remain same for any other user
router.patch('/staff/update', auth, async function (req, res) {

    // Check if admin is logged in
    if (req.user.role !== 'admin') {
        res.status(400).send('Login as admin.')
    }

    // Check email parameter cannot be admin
    const userEmail = { email: req.query.email };
    if (userEmail.email === 'admin@college.io') {
        res.status(400).send('Cannot update admin data.');
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
        return res.status(400).send('Invalid updates!');
    }

    try {
        const staff = await Users.findOne(userEmail);
        updates.forEach((update) => staff[update] = req.body[update]);
        await staff.save();
        res.send(staff);

    } catch (e) {
        res.status(400).send(e);
        logger.error(e.message)
    }
})

// Delete staff data - DELETE METHOD
router.delete('/staff/delete', auth, async function (req, res) {

    if(req.user.role !== 'admin')
    {
        res.status(400).send("Cannot delete admin.")
    }
    try {
        if(req.query.email === 'admin@college.io')
        {
            throw new Error();
        }
        const staff = await Users.findOneAndDelete({ email: req.query.email });
        res.send(staff)
    } catch(e)
    {
        res.status(400).send(e)
    }
    
})
// Export user-Route Module
module.exports = router;