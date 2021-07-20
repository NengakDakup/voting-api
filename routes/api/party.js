const express = require('express');
const router = express.Router();

const formidable = require('formidable');

// load the Party Database Model
const Party = require('../../models/Party');

// load Authentication Middleware
const {Authenticate} = require('../../controllers/Authenticator');

const dotenv = require('dotenv');
dotenv.config();


// Returns a list of all Parties
router.get('/', Authenticate, (req, res) => {
    Party.find().then(parties => {
        return res.json({success: true, data: parties})
    })
});

// Creates a Party

//finifh up image upload for here
// will candidates image be uploaded too?
router.post('/', Authenticate, (req, res) => {
    // image upload with formidable
    const form = formidable({ multiples: true, keepExtensions: true, uploadDir: __dirname + '/../../public/images/' });
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({error: 'Please Try Again'});
        }

        const {ID, name, acronym, candidateName, candidatePosition, candidateLocalGovt} = fields;
        const {partyImage, candidateImage} = files;
        
        const partyImageUrl = process.env.server + 'images/upload_' + partyImage.path.split('upload_')[1];
        const candidateImageUrl = process.env.server + 'images/upload_' + candidateImage.path.split('upload_')[1];

        



        if(!name || !partyImage || !candidateImage || !acronym || !candidateName || !candidatePosition || !candidateLocalGovt){
            return res.json({error: 'Please fill all fields'});
        } else {
            const newParty = new Party({
                ID,
                name,
                partyImageUrl,
                acronym,
                candidateImageUrl, 
                candidateName, 
                candidatePosition,
                candidateLocalGovt
            });
    
            newParty.save().then(newPartyData => res.json({success: 'Party Successfully Created', data: newPartyData}))
        }
    });
    

    
})

// Returns an Party According to the ID
router.get('/:partyId', Authenticate, (req, res) => {
    const {partyId} = req.params;

    Party.findOne({ID: partyId}).then(party => {
        if(!party) return res.status(404).json({error: 'Party Not Found'})
        return res.json({success: true, data: party})
    })
})

// Delete a Party According to the ID
router.delete('/:partyId', Authenticate, (req, res) => {
    const {partyId} = req.params;

    Party.deleteOne({ID: partyId}).then(operation => res.json({success: true, data: operation}))
}) 

module.exports = router;