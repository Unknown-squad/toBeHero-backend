// Load required packeges
const express = require('express');
const app = express();
const path = require('path');
const dotenv = require(`dotenv`);
const morgan = require(`morgan`);
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const fileUpload = require('express-fileupload');

// load routes
const courses = require(`./routes/course`);
const mentorRoutes = require('./routes/mentor');
const subscriptions = require('./routes/subscription');
const authRoutes = require(`./routes/auth`);

// Add middleware files
/* const {subscriptionErrorHandling} = require('./middlewares/subscriptionErrorHandling');
const errorHandler = require('./middlewares/error') */
const {errorHandling} = require(`./middlewares/ErrorHandling`);

// Add config files
const connectDB = require(`./config/db`);

// CORS security
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Read body of request
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// use file upload
app.use(fileUpload());

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
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 90,
      // secure: true
  }
}));

// Access to public folder
app.use(express.static(path.join(__dirname, 'public')));

// save user session in req.user variable
app.use((req, res, next) => {
  req.isLoggedIn = false;
  
  if (req.session) {
    req.isLoggedIn = req.session.isLoggedIn;
    req.user = req.session.user;
  };
  next();
})

// use routes
app.use(mentorRoutes)
app.use(subscriptions);
app.use(courses);
app.use(authRoutes);

app.use((req, res, next) => {
  return res.status(404).json({
    success: false,
    error: {
      code: 404,
      message: `this url not found`
    }
  })
});

// Use error handler
app.use(errorHandling);
/* app.use(errorHandler);
app.use(subscriptionErrorHandling); */

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