// Modules
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Students = require('./student')

// Schema for staff data
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Enter valid admin email address.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain password.')
            }
        }
    },
    role: {
        type: String,
        required: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

// Connect Userschema to studentSchema 
userSchema.virtual('students', {
    ref: 'Students',
    localField: '_id',
    foreignField: 'staffId'
})

// Schema method that will display JSON Object as response
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

// Generate token to verify and authenticate with staff
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'secretkey');
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

// To check staff login with original credentials
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await Users.findOne({ email })
    if (!user) {
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user
}


// Save data if it gets suceed in promise
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

// Model to store user data
const Users = mongoose.model('Staffs', userSchema);
Users.createIndexes();

// Export Admin-Model Module 
module.exports = Users;