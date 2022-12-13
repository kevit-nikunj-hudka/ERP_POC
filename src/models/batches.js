// Modules
const mongoose = require('mongoose');

// Batch Schema  
const batchSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true
    },
    branches: [{
        name: {
            type: String,
            required: true
        },
        totalStudentsIntake: {
            type: Number,
            required: true
        }
    }]
});

// Btach model for data collection
const Batches = mongoose.model('Batches', batchSchema);

// Exports Batch model 
module.exports = Batches;