const jwt = require('jsonwebtoken');
const Electioneer = require('../models/Electioneer');


const dotenv = require('dotenv');
dotenv.config();

function Authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if(!authHeader) return res.json({error: 'Please Login First'});
    const token = authHeader.split(' ')[1];
    
    const {JWTKey} = process.env;

    try {
        const decoded = jwt.verify(token.toString(), JWTKey);
        Electioneer.findById(decoded.id)
            .then(electioneer => {
                if(electioneer.status !== 'admin'){
                    throw err;
                } else {
                    req.user = decoded;
                    next()
                }
            }).catch(err => res.status(400).json({error: 'Please Login First'}))  
    } catch(err){
        return res.status(400).json({error: 'Please Login First'});
    }
}

module.exports = {Authenticate};