// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const database = require('./resources/js/database');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server


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
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  // next item on the to do list is to take the username and password and insert them into the users table 
  let username = req.body.username; // think this will be fine 

  const submission = `INSERT INTO users (username, password) VALUES( '${username}', '${hash}') `; // think we're supposed to insert the hashed value, but I am not sure 
  db.any(submission)
    .then((data) => {
      res.status(200).redirect('/login'); // believe this is the most I am supposed to do here. 
      // think I need to use the get route here, not sure if I need to do more 
    })
    .catch((err) => {
      res.status(400).redirect('/register'); // think I am supposed to utilize the get routes, but not sure how to do that. 
      // current survey says I don't need to do anything, will have to check about that. 
    })
});

app.get('/login', (req, res) => {
  res.render('pages/login'); // this should be fine 
});

app.post('/login', async (req, res) => {
  //res.json({status: 'success', message: 'Welcome!'});
  const user = {
    username: undefined,
    password: undefined,
  };
  // first things first, we need to go and get their appropriate methedology 
  const userSelect = `SELECT * FROM users WHERE username = '${req.body.username}' `; // think the querty will return everything 
  // above is a com
  // think the trick with ths one is to do a db.any and then check with an if statement to see what is and is not true.
  db.any(userSelect).then(async (data) => {
    user.username = data[0].username;
    user.password = data[0].password;
    // console.log(data);
    // console.log(user.username);
    // console.log(user.password);
    const passCheck = await bcrypt.compare(req.body.password, user.password); // needs to be put here for posterity
    //  console.log(passCheck);
    // if statement makes sure that things will work just fine 
    if (passCheck == false) {
      res
        .body.message('invalid input')
        .status(200)
        .redirect('/login');
    } else {
      // below is the default code for the login side of things. 
      req.session.user = user;
      req.session.save();

      // goal is to redirect to the discover object before anything else 

      //res.redirect('/discover');
    }

  }).catch((err) => {
    console.log(err);
    res
      .status(400)
      .redirect("/login");
  });
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
app.get("/homepage", (req,res) => {
    
  // req.session. user should show user name 
  const userfavorites = `SELECT * FROM books INNER JOIN users_to_books ON books.bookId = users_to_books.bookId INNER JOIN users ON  users_to_books.username = users.username WHERE users.username = '${req.session.user.username}' `
  db.any(userfavorites)
  .then()
  .catch((err) => {
    console.log(err);
    res
    .status(400)
  });

});
// pasting Jeremy's search thingie to get an idea of how to use the API 
//Needs another page that doesnt render results for search
app.get('/search', (req,res) =>{
  res.render('pages/search')
})
app.post('/search', (req,res) =>{
  //checks if something is put in, if not defaults to fantasy
  let title = req.body.query;
  console.log(req.body.title)
  if(title != undefined){
    title  = req.body.title;
  }else{
    title = "fantasy";
  }
  //renders search page with title and author
  const response = axios.get('https://www.googleapis.com/books/v1/volumes?q='+title+'&maxResults=10')
  .then(results=>{
    //console.log(results.data.items[0].volumeInfo.title)
    const books = results.data.items || [];
    res.render('pages/search', { books });
  })
   
    //console.log(res.data))
  .catch(err=>console.log(err))
    //const books = response.data.items || [];
    //console.log(books);
});
//for this branch, we will be adding a route for Bookpage, this should be a get, and should be able to take things correctly 

// also going to note, there will be a post route for adding to favorites, this will 
app.post("/bookPage", function(req,res) {
  const bookQuery = `select * from books where books.title = '${req.body.title}' returning books.bookId LIMIT 1`; 
  // db.any will be sufficient 
  db.any(bookQuery)
  .then(function(data) {
     const postquery = `insert into users_to_books( username, bookId) values ('${data[0][0].bookId}', '${req.session.user.username}' )`; 
     // second db.any will be required? 
     db.any(postquery).then(res.status(201).message('Book added to favorites'))
  })
})
// for testing purposes, leaving this here 
/*module.exports = */app.listen(3000);