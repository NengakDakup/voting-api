const express = require('express');
const formidable = require('formidable');
const router = express.Router();

// Load the voters database model
const Voter = require('../../models/Voter');

// load Authentication Middleware
const {Authenticate} = require('../../controllers/Authenticator');

const dotenv = require('dotenv');
dotenv.config();

// returns a list of all voters
router.get('/', Authenticate, (req, res) => {
    Voter.find().then(voters => res.json({success: true, data: voters}))
});


// create a voter 

// Todo - Make Sure to retrain the data when a new voter is added
router.post('/', Authenticate, (req, res) => {
    const form = formidable({ multiples: true, keepExtensions: true, uploadDir: __dirname + '/../../public/images/' });
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({error: 'Please Try Again'});
        }

        const {fullname, age, localGovt, stateOfOrigin, occupation, secretPhrase} = fields;
        const {image, voiceSample} = files;

        if(!fullname, !image, !age, !localGovt, !stateOfOrigin, !occupation, secretPhrase){
            res.status(400).json({error: 'Please fill All Fields'});
        } else {
            const newVoter = new Voter({
                fullname,
                image,
                age, 
                localGovt,
                stateOfOrigin, 
                occupation, 
                secretPhrase,
                voiceSample
            });

            newVoter.save().then(newVoterData => res.json({success: true, data: newVoterData}))
        }


    });
    
});

// returns a particular voter
router.get('/:voterId', Authenticate, (req, res) => {
    const {voterId} = req.params;

    Voter.findOne({ID: voterId}).then(voter => res.json({success: true, data: voter}))

});

// Delete a particular voter
router.delete('/:voterId', Authenticate, (req, res) => {
    const {voterId} = req.params;

    Voter.deleteOne({ID: voterId}).then(operation => res.json({success: true, data: operation}))

});

// Assign a unique voice phrase to the voter
router.put('/:voterId/voice-phrase', Authenticate, (req, res) => {
    const {voterId} = req.params;

    const {phrase} = req.body;

    Voter.findOne({ID: voterId}).then(voter => {
        voter.phrase = phrase;
        voter.save().then(voterData => res.json({success: true, data: voterData}))
    })
});

// Quick way to verify and log in voter /??
router.post('/verify-id', Authenticate, (res, req) => {

});

module.exports = router;