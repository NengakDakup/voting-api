const express = require('express');
const bodyParser = require('body-parser');
// const passport = require('passport');
const cors = require('cors');
const mongoose =  require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

// DB Config
const db = process.env.localURI;

// Connect to the mongodb
mongoose.connect(process.env.localURI || db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Load the routes from the api
const election = require('./routes/api/election');
const voter = require('./routes/api/voter');
const party = require('./routes/api/party');
const electioneer = require('./routes/api/electioneer');



// Initialize the app
const app = express();

// set the directory for loading assets from the server
app.use(express.static('public'));


// Enable cors middleware for enabling cross origin requests
app.use(cors());


// Body parser middleware for parsing requests to json formats
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Load the routes into the application
app.use('/api/election', election);
app.use('/api/voter', voter);
app.use('/api/party', party);
app.use('/api/electioneer', electioneer);


// Select the port for the application
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.json({status: 'Working'})
})

// Listen on the selected ports for any incoming requests
app.listen(port, () => {
    console.log(`Server has started on port ${port}`);
})