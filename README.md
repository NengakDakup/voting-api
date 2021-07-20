# voting-api

Voting Backend API

## Required Environment Variables
Create a .env file with the following variables
- localURI (This Should contain the server address for the mondb databse to be used)
- server (This should contain the location of this server http://localhost:5000/)
- JWTKey (Any Random Alphanumeric characters would suffice e.g uipoy-09tnjd-njdk8d )

## Starting the server
make sure to first install all project dependencies by running the below command
> npm install
>
run the command below in the terminal to start the server
> npm run dev

## Api Routes

All API Responses are in the below format:
### when there is no error
> {success: `true`, data: `Expected Data According to the context`}

> **POST** - /api/electioneer/login
> **DATA** { name: String, username: String }
> **RESPONSE** 
