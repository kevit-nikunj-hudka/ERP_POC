const mongoose = require('mongoose');
const validator = require('validator');
const Users = require('./users');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: Number,
        required: true,
        minLength: 10,
        maxLength: 10,
    },
    department: {
        type: String,
        required: true,
        toUpperCase: true
    },
    batch: {
        type: Number,
        required: true,
        minLength: 4,
        default: new Date().getFullYear()
    },
    currentSem: {
        type: Number,
        required: true
    }, 
    attendance: {
        type: Array,
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Users'
    }
}, {
    timestamps: true
});

// Schema method that will display JSON Object as response
studentSchema.methods.toJSON = function () {
    const student = this;
    const studentObject = student.toObject();

    return studentObject;
}

// Student model for data collection
const Students = mongoose.model('Students', studentSchema);

// Exports Student module
module.exports = Students;