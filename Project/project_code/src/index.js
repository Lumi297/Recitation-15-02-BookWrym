// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// dummy route for testing and lab 11 purposes
app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });


// copy pasting lab 9 routes for testing purposes

app.get('/login', (req, res) => {
    res.render('pages/login'); // this should be fine 
});

app.post('/login', async(req, res) => {
  const user = {
    username: undefined,
    password: undefined,
};
    // first things first, we need to go and get their appropriate methedology 
    const userSelect = `SELECT * FROM users WHERE username = '${req.body.username}' `; // think the querty will return everything 
    // above is a com
    // think the trick with ths one is to do a db.any and then check with an if statement to see what is and is not true.
    db.any(userSelect).then(async (data)=>{
      user.username = data[0].username;
      user.password = data[0].password;
      console.log(data);
      console.log(user.username);
      console.log(user.password);
      const passCheck = await bcrypt.compare(req.body.password, user.password); // needs to be put here for posterity
       console.log(passCheck);
      // if statement makes sure that things will work just fine 
      if (passCheck ==false){
          res.redirect('/login');
      } else {
        // below is the default code for the login side of things. 
        req.session.user = user;
        req.session.save();
         // goal is to redirect to the discover object before anything else 
        res.status(200);
      }

    }).catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});


// for testing purposes, leaving this here 
module.exports = app.listen(3000);