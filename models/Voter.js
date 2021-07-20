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
    image: {
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
        type: String
    },
    voiceSample: {
        type: String
    },
    date: {
      type: Date,
      default: Date.now
    }

})

const Voter = mongoose.model('voters', VoterSchema);
module.exports = Voter;
