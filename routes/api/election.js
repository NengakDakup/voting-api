const express = require('express');
const router = express.Router();

// load Database Models
const Election = require('../../models/Election');
const Voter = require('../../models/Voter');

// load Authentication Middleware
const {Authenticate} = require('../../controllers/Authenticator');

const dotenv = require('dotenv');
dotenv.config();


// Returns a list of all electionsv
router.get('/', Authenticate, (req, res) => {
    Election.find().then(elections => res.json({success: true, data: elections}))
});

// Creates an Election
router.post('/', Authenticate, (req, res) => {
    const {ID, name, type} = req.body;

    if(!ID || !name || !type){
        return res.status(400).json({error: 'Please Fill All Fields'});
    } else {
        //create the record
        const newElection = new Election({
            ID,
            name, 
            type, 
            status: 'Ongoing', 
            date: Date.now()
        });

        //save the record
        newElection.save().then(newElectionData => res.json({success: 'New Election Successfully Created', data: newElectionData}))
    }
})

// Returns an Election According to the ID
router.get('/:electionId', Authenticate, (req, res) => {
    const {electionId} = req.params;

    Election.findOne({ID: electionId}).then(election => {
        if(!election) return res.status(404).json({error: 'Not Found'});
        return res.json({success: true, data: election})
    }).catch(err => res.json({error: true}))

})

// Delete an Election According to the ID
router.delete('/:electionId', Authenticate, (req, res) => {
    const {electionId} = req.params;

    Election.deleteOne({ID: electionId}).then(operation => {
        if(operation.deletedCount === 1){
            return res.json({success: true})
        } else {
            return res.status(404).json({error: true})
        }
        
    })
}) 

// Voting Process
router.post('/:electionId/vote', Authenticate, (req, res) => {
    const {electionId} = req.params;

    const {voterId, partyId} = req.body;

    Election.findOne({ID: electionId}).then(election => {
        if(!election) return res.status(404).json({error: 'Election Not Found'});

        // check if the voter exists
        Voter.findOne({ID: voterId}).then(voter => {
            if(!voter) return res.status(404).json({error: 'Voter Not Found'});

            let alreadyVoted = false;
            // Check if Voter has already voted
            election.ballots.filter(data => {
                if(data.voterId === voterId){
                    alreadyVoted = true;
                }
            })

            if(alreadyVoted === true){
                res.status(400).json({error: 'Already Voted'});
            } else {
                const vote = {voterId, partyId};
                election.ballots.push(vote);
                election.save().then(electionData => res.json({success: 'Vote Casted', data: electionData}))
            }
        })

        
    })

});

// Register a Voter to a particular Election
// Create a new Voter if voter does not exist
router.put('/:electionId/register-voter', Authenticate, (req, res) => {
    const {electionId} = req.params;
    const {voterId} = req.body;

    Election.findOne({ID: electionId}).then(election => {
        Voter.findOne({ID: voterId}).then(voter => {
            if(!voter) return res.status(404).json({error: 'Voter Not Found'});

            //check if voter has already registered
            let alreadyRegistered = false;
            
            election.registeredVoters.filter(data => {
                if(data.voterId === voterId){
                    alreadyRegistered = true;
                }
            })

            if(alreadyRegistered === true){
                return res.status(400).json({error: 'Already Registered'});
            } else {
                election.registeredVoters.push(voterId);
                election.save().then(data => {
                    return res.json({success: 'Voter Registered'})
                })
            }
        })
        

    })
})

// Register a Party to an election
router.put('/:electionId/register-party', Authenticate, (req, res) => {
    const {electionId} = req.params;
    const {partyId} = req.body;

    Election.findOne({ID: electionId}).then(election => {
        if(!election) return res.status(404).json({error: 'Election Not Found'});

        //check if party exists
        Party.findOne({ID: partyId}).then(party => {
            if(!party) return res.status(404).json({error: 'Party Not Found'});

            election.registeredParties.push(partyId);
            election.save().then(electionData => res.json({success: true, data: electionData}))
        })
    })

})

// Get Elections by their status value
// archived || ongoing || upcoming
router.get('/:status', Authenticate, (req, res) => {
    const {status} = req.params;

    Election.find({status: satus}).then(elections => {
        return res.json({success: true, data: elections})
    })
})

//Edit the Status of an Election
router.post('/:electionId/update-status', Authenticate, (req, res) => {
    const {electionId} = req.params;

    const {status} =  req.body;

    Election.findOne({ID: electionId}).then(election => {
        if(!election) return res.status(404).json({error: 'Election Not found'});

        election.status = status;
        election.save().then(electionData => res.json({success: true, data: electionData}))
    })
})

module.exports = router;