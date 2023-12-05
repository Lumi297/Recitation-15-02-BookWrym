// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const database = require('./resources/js/database');

// For external CSS files
app.use(express.static('resources'));

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
  res.json({ status: 'success', message: 'Welcome!' });
});

// 

// default
app.get('/', (req, res) => {
  res.redirect('/register');
});

// copy pasting lab 9 routes for testing purposes
app.get('/register', (req, res) => {
  res.render('pages/register'); // rendering the page gher 
});

// register will have multiple components, above is get, below is the post 
// going to make a note of this so I remember, the async function is required here 
app.post('/register', async (req, res) => {
  try {
    // Hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);

    // Take the username and hashed password and insert them into the users table
    const username = req.body.username;

    await database.register(username, hash);
    res.status(200).redirect('/login');
  } catch (error) {
    if (error.message.includes('duplicate key value')) {
      // Duplicate username error handling
      res.status(400).render('pages/register', { error: 'Username already exists. Choose a different one.' });
    } else {
      // General error handling
      console.error(error);
      res.status(500).render('pages/register', { error: 'Internal Server Error' });
    }
  }
});

app.get('/login', (req, res) => {
  res.render('pages/login'); // this should be fine 
});

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await database.login(username, password);
    res.status(200).redirect('/search');
  } catch (error) {
    console.log(error);
    res.status(401).render('pages/login', { error: 'Invalid username or password' });
  }
});

app.get('/search', (req, res) => {
  const books = [];
  res.render('pages/search', { books });
})

//Needs another page that doesnt render results for search
app.post('/search', async (req, res) => {
  //checks if something is put in, if not defaults to fantasy
  let title = req.body.search;
  let typeOf = req.body.selectCategory;
  let numResults = req.body.numResults;
  console.log(typeOf);
  console.log(title);
  console.log(numResults);
  if (title == undefined) {
    title = "Fantasy"
  } else {
    //title = '"' + title.replace(/\s/g, '+') + '"'
    title = '"' + title + '"'
  }
  console.log(title)
  if (typeOf == "title") {
    typeOf = ""
  } else if (typeOf == "author") {
    typeOf = "inauthor:"
  } else {
    typeOf = "subject:"
  }

  const books = await database.getBooks(typeOf + title, numResults);
  res.render('pages/search', { books: books });
  //renders search page with title and author
});

//for this branch, we will be adding a route for Bookpage, this should be a get, and should be able to take things correctly 
app.get("/bookPage", function (req, res) {

});
// also going to note, there will be a post route for adding to favorites, this will 

// for testing purposes, leaving this here 
/*module.exports = */app.listen(3000);