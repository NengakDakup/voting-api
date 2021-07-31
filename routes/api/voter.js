const express = require('express');
const formidable = require('formidable');
const router = express.Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Load the voters database model
const Voter = require('../../models/Voter');

// load Authentication Middleware
const {Authenticate} = require('../../controllers/Authenticator');

// load Training and prediction functions
const {runPrediction, trainData} = require('../../scripts/run');


const dotenv = require('dotenv');
const Election = require('../../models/Election');
dotenv.config();

// returns a list of all voters
router.get('/', Authenticate, (req, res) => {
    Voter.find().then(voters => res.json({success: true, data: voters}))
});


// create a voter 
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
        }

        const {ID, fullname, age, localGovt, stateOfOrigin, occupation} = fields;
        const {image} = files;
        const imageUrl = process.env.server + 'images/upload_' + image.path.split('upload_')[1];


        if(!ID || !fullname || !imageUrl || !age || !localGovt || !stateOfOrigin || !occupation || !secretPhrase){
            res.status(400).json({error: 'Please fill All Fieldzzz'});
        } else {
            // get the index to use for the current user
            Voter.find().then(voters => {
                let voterIndex = voters.length;
                const newVoter = new Voter({
                    ID,
                    fullname,
                    imageUrl,
                    age, 
                    localGovt,
                    stateOfOrigin, 
                    occupation, 
                    secretPhrase,
                    voterIndex
                });

                newVoter.save().then(newVoterData => res.json({success: true, data: newVoterData}))
            })    
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
// work on the format the audio files are saved
// Todo - Make Sure to retrain the data when a new voter is added
router.put('/:voterId/voice-sample', Authenticate, (req, res) => {
    const {voterId} = req.params;

    Voter.findOne({ID: voterId}).then(voter => {
        if(!voter) return res.status(404).json({error: 'Voter not found'});
        
        const form = formidable({ multiples: true, keepExtensions: true, uploadDir: __dirname + '/../../public/samples/' });
        form.parse(req, (err, fields, files) => {
            if(err){
                return res.status(400).json({error: 'Please Try Again'});
            }

            
            console.log('dir', __dirname + '\\..\\..\\public\\samples');
            // find the last users number so we can know what to use as this users number
            let userIndex = voter.voterIndex;
            if(userIndex < 10){
                userIndex = '0' + userIndex;
            }
            let fileName = userIndex + '-' + voter.fullname.split(' ')[0];
            
            // use fs.rename() to change the file names to the appropriate standard
            // fs.rename(oldpath, newpath, callback(err))
            const {sample1, sample2, sample3, sample4, sample5, sample6, sample7, sample8, sample9, sample10} = files;
            if(!sample1 || !sample2 || !sample3 || !sample4 || !sample5 || !sample6 || !sample7 || !sample8 || !sample9 || !sample10) return res.status(404).json({error: 'Please upload all voice samples'})
            const voiceSample = [sample1.path, sample2.path, sample3.path, sample4.path, sample5.path, sample6.path, sample7.path, sample8.path, sample9.path, sample10.path];
            let newVoiceSampePaths = [];

            voiceSample.filter((path, index) => {
                newPath = __dirname + '\\..\\..\\public\\samples\\' + fileName + `-${index}.flac`;
                newVoiceSampePaths.push(newPath);
                fs.rename(path, newPath, (err) => {
                    if(err) return res.status(400).json({error: true});
                });

                if(index === 9){
                    voter.voiceSample = newVoiceSampePaths;
                    //call the retrain data function here
                    trainData();
                    voter.save().then(voterData => res.json({success: true, data: voterData}))
                }
                
            })
        })
    })
});

// Quick way to verify and log in voter /??
// A token is returned which should expire in 5mins or so
router.post('/:voterId/:electionId/verify-voter', Authenticate, (req, res) => {
    const {voterId, electionId} = req.params;

    Election.findOne({ID: electionId}).then(election => {
        if(!election) return res.status(404).json({error: 'Election not Found'});
        let voterRegistered = false;
        let voterRegisteredIndex = null;
        let voterFailedAttempts = 0;
        election.registeredVoters.map((registeredData, i) => {
            if(registeredData.voterId === voterId){
                voterRegistered = true;
                voterRegisteredIndex = i;
                voterFailedAttempts = registeredData.failedAttempts;
            } 
        })

        if(!voterRegistered) return res.status(404).json({error: 'Voter Not Registered For Election'});

        //
        Voter.findOne({ID: voterId}).then(voter => {
            if(!voter) return res.status(404).json({error: 'Voter not found'});
    
            const form = formidable({ multiples: true, keepExtensions: true });
            form.parse(req, (err, fields, files) => {
                if(err){
                    return res.status(400).json({error: 'Please Try Again'});
                }
    
                if(!files.voiceSample) res.status(400).json({error: 'Please fill All Fields'});
                const voiceSample = files.voiceSample.path;
    
                // call the python script with voiceSample as the argument
                (async function(){
                    const result = await runPrediction(voiceSample);
                    // return res.json(result);
                    // check if voter id is equal to the voters id returned by the python script
                    // if it is equal to create token and return
                    if(result === voter.voterIndex){
                        const {JWTKey} = process.env;
                        const payload = { voterId, electionId, authenticated: true };

                        jwt.sign(payload, JWTKey, {expiresIn: 604800}, (err, token) => {
                            return res.json({success: true, data: token})
                        });
                        
                    } else {
                        // add to the number of user failed attempts
                        election.registeredVoters[voterRegisteredIndex].failedAttempts = voterFailedAttempts++;
                        election.save().then(newData => res.json({error: 'Voter Authentication Failed, Please Try Again'}));
                    }
                    
                    
                })() 
            })
        })
    })

    
    
});

module.exports = router;