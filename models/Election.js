const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ElectionSchema = new Schema({
    ID: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    registeredParties: [
        {
            partyId: {
                type: String
            } 
        }
    ],
    registeredVoters: [
        {
            voterId: {
                type: String
            },
            failedAttempts: {
                type: Number
            }
        }
    ],
    ballots: [
        {
            voterId: {
                type: String
            },
            partyId: {
                type: String
            }
        }
    ],
    date: {
      type: Date,
      default: Date.now
    }

})

const Election = mongoose.model('elections', ElectionSchema);
module.exports = Election;
