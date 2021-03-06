const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const VoterSchema = new Schema({
    ID: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String
    },
    age: {
        type: Number
    },
    localGovt: {
        type: String
    },
    stateOfOrigin: {
        type: String
    },
    occupation: {
        type: String
    },
    secretPhrase: {
        type: Array
    },
    voiceSample: {
        type: Array
    },
    voterIndex: {
        type: Number
    },
    date: {
      type: Date,
      default: Date.now
    }

})

const Voter = mongoose.model('voters', VoterSchema);
module.exports = Voter;
