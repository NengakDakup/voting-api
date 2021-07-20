const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ElectioneerSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
      type: Date,
      default: Date.now
    }

})

const Electioneer = mongoose.model('electioneers', ElectioneerSchema);
module.exports = Electioneer;
