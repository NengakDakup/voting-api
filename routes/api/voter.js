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

        // Generate a seceret phrase for the voter
        let availableWords = ['door', 'rub', 'tie', 'tense', 'plain', 'raw'];
        let secretPhrase = [];
        for (let i = 0; i < 4; i++) {
            randNum = Math.floor(Math.random() * availableWords.length); // Generate A random number btw the length of array
            var randWord = availableWords[randNum]; // get the random word
            secretPhrase.push(randWord); // add the radom word to the users secret phrase
            availableWords.splice(randNum, 1); // remove the word from the available word to avoid repitition of words 

            console.log(randNum);
            console.log(availableWords);
            
        }

        const {fullname, age, localGovt, stateOfOrigin, occupation} = fields;
        const {image} = files;
        const imageUrl = process.env.server + 'images/upload_' + image.path.split('upload_')[1];

        if(!fullname || !imageUrl || !age || !localGovt || !stateOfOrigin || !occupation || secretPhrase){
            res.status(400).json({error: 'Please fill All Fields'});
        } else {
            const newVoter = new Voter({
                fullname,
                imageUrl,
                age, 
                localGovt,
                stateOfOrigin, 
                occupation, 
                secretPhrase,
            });

            newVoter.save().then(newVoterData => res.json({success: true, data: newVoterData}))
        }


    });
    
});

// returns a particular voter
router.get('/:voterId', Authenticate, (req, res) => {
    const {voterId} = req.params;

    Voter.findOne({ID: voterId}).then(voter => {
        if(!voter) return res.status(404).json({error: true})
        return res.json({success: true, data: voter})
    })

});

// Delete a particular voter
router.delete('/:voterId', Authenticate, (req, res) => {
    const {voterId} = req.params;

    Voter.deleteOne({ID: voterId}).then(operation => res.json({success: true, data: operation}))

});

// Save a Users Voice Sample
router.put('/:voterId/voice-sample', Authenticate, (req, res) => {
    const {voterId} = req.params;

    Voter.findOne({ID: voterId}).then(voter => {
        if(!voter) return res.status(404).json({error: 'Voter not found'});
        
        const form = formidable({ multiples: true, keepExtensions: true, uploadDir: __dirname + '/../../public/samples/' });
        form.parse(req, (err, fields, files) => {
            if(err){
                return res.status(400).json({error: 'Please Try Again'});
            }

            const {sample1, sample2, sample3, sample4, sample5, sample6, sample7, sample8, sample9, sample10} = files;
            const voiceSample = [sample1.path, sample2.path, sample3.path, sample4.path, sample5.path, sample6.path, sample7.path, sample8.path, sample9.path, sample10.path];

            voter.voiceSample = voiceSample;
            voter.save().then(voterData => res.json({success: true, data: voterData}))
        })
    })
});

// Quick way to verify and log in voter /??
router.post('/verify-id', Authenticate, (res, req) => {

});

module.exports = router;