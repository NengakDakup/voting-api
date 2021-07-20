const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config();

const Electioneer = require('../../models/Electioneer');

// Log in an Electioneer - Access Token will be returned
router.post('/login', (req, res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({error: 'Please Fill all Fields'});
    } else {
        Electioneer.findOne({username: username.toLowerCase()}).then(electioneer => {
            if(!electioneer) return res.status(404).json({error: 'Account not found'});

            //compare passwords
            bcrypt.compare(password, electioneer.password)
                .then(isMatch => {
                    if(isMatch){
                        // create a jwt payload
                        const payload = { id: electioneer.id, username: electioneer.username, status: electioneer.status };
                        // Sign the Token
                        // expires in one week
                        jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
                            res.json({success: true, data: 'Bearer ' + token})
                        });
                        // create cookie

                        // redirect to dashboard
                        // res.redirect('/dashboard');
                    } else {
                        return res.status(404).json({error: 'Incorrect Password'})
                    }
                })
        })
    }
});

router.post('/signup', (req, res) => {
    const {username, password} = req.body;

    if(!username || !password) return res.status(400).json({error: 'Please fill All Fields'});

    Electioneer.findOne({username: username}).then(electioneer => {
        // update the password if electioneer exists
        if(electioneer){
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if(err) throw err;
                    user.password = hash;
                    user.save().then(user => res.json({success: true}));
                })
            })
        } else {
            //create a new account
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if(err) throw err;
                    // new user details
                    const newElectioneer = new Electioneer({
                        username: username.toLowerCase(),
                        password: hash,
                        status: 'admin'
                    });
                    newElectioneer.save().then(userData => res.json({success: true}));
                })
            })
            
        }
    })
})


// Returns a list of all electioneers
router.get('/', (req, res) => {

});

// Creates an Electioneer
router.post('/', (req, res) => {

})

// Returns an Electioneer According to their ID
router.get('/:id', (req, res) => {

})

// Delete an Electioneer According to the ID
router.delete('/:id', (req, res) => {

})

// Delete an Electioneers????
router.delete('/', (req, res) => {

})

module.exports = router;