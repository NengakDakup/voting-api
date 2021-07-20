const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PartySchema = new Schema({
    ID: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    partyImageUrl: {
        type: String,
        required: true,
    },
    acronym: {
        type: String,
        required: true,
    },
    candidateImageUrl: {
        type: String,
        required: true
    },
    candidateName: {
        type: String,
        required: true,
    },
    candidatePosition: {
        type: String,
        required: true,
    },
    candidateLocalGovt: {
        type: String,
        required: true,
    },
    date: {
      type: Date,
      default: Date.now
    }

})

const Party = mongoose.model('parties', PartySchema);
module.exports = Party;
