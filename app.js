// Load required packeges
const express = require('express');
const app = express();
const path = require('path');
const dotenv = require(`dotenv`);
const morgan = require(`morgan`);
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// load routes
const courses = require(`./routes/course`);

// Add config files
const connectDB = require(`./config/db`);
const {coursesErrorHandling} = require(`./middlewares/coursesErrorHandling`);

// Read body of request
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// using dotenv
dotenv.config({path: `./config/config.env`});

// use morgan
if(process.env.NODE_ENV === `development`) {
  app.use(morgan(`dev`));
}

// Connect to mongodb
connectDB();

// Save sessions to mongodb
let store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'mySessions'
});

// Connect to session
app.use(require('express-session')({
    secret: 'This is secret',
    store: store,
    resave: false,
    saveUninitialized: false
}));

// Access to public folder
app.use(express.static(path.join(__dirname, 'public')));

// Add routes files
app.use(courses);

// handling error of courses
app.use(coursesErrorHandling);

// Connect to server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening to server in ${process.env.NODE_ENV} mode on port ${port}...`);
});

// handle crash server error
process.on('unhandledRejection', (reason, promise) => {
    console.log(`ERROR: ${reason}`);
    server.close(() => process.exit(1));
});