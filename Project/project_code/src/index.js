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

const auth = (req, res, next) => {
  if (!req.session.user && req.url != "/login" && req.url != "/register"&&req.url!="/search") {
    return res.redirect("/login");
  }
  next();
};

app.use(auth);

// dummy route for testing and lab 11 purposes
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' }).status(200);
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
      res.status(200).render('pages/register', { error: 'Username already exists. Choose a different one.' });
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
    req.session.user = user;
    req.session.save();
    res.status(200).redirect('/homepage');
  } catch (error) {
    console.log(error);
    res.status(200).render('pages/login', { error: 'Invalid username or password' });
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

// up next is the creation of a home page for the user: this should include user info, and a collection of books that they have 
app.get("/homepage", async (req, res) => {
  const userBookIds = await database.getUserBookIds(req.session.user.username);
  const books = await Promise.all(userBookIds.map(async (id) => {
    const book = await database.getBook(id);
    return book;
  }));
  res.render('pages/homePage', { books: books, user: req.session.user });
});

// also going to note, there will be a post route for adding to favorites, this will 
app.get("/bookPage/:bookID", async function(req, res) {
  try {
    const book = await database.getBook(req.params.bookID);
    const bookAuthor = book.volumeInfo.authors[0];
    console.log("inauthor:" + bookAuthor);
    
    const authorRec = await database.getBooks("inauthor:" + bookAuthor, 5);

    const tags = await database.getTagsbyBook(book.id);

    res.render('pages/bookPage', { book: book, recommendations: authorRec, tags:tags});
  } catch (error) {
    console.error('Error in /bookPage route:', error);
    res.status(500).send('Internal Server Error');
  }
});


// for testing purposes, leaving this here 
app.listen(3000);
