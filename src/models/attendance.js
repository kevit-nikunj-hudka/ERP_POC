// Required Modules
const mongoose = require('mongoose');

// Attendance Schema 
const attendanceSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    currentSem: {
        type: Number,
        required: true
    },
    attendance: {
        date: {
            type: String,
            required: true
        },
        list: {
            type:Array,
            default: []
        }
    }
})

// Schema method that will display JSON Object as response
attendanceSchema.methods.toJSON = function () {
    const attendanceDoc = this;
    const attendanceDocObject = attendanceDoc.toObject();

    return attendanceDocObject;
}

// Attendance model for data collection
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Export Attendance Module
module.exports = Attendance;