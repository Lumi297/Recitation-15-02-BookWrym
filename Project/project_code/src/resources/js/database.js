// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
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

module.exports = {
    /**
     * Searches for matching results using books API, loads data into DB, then returns JSON object
     * @param {String} query
     * @param {Number} numResults
     * @returns {Promise<JSON>}
     */
    getBooks: function (query, numResults) {
        return new Promise((resolve, reject) => {
            axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${numResults}`)
                .then(results => {
                    const books = results.data.items;
                    //add book info to database
                    books.forEach(async (book) => {
                        const title = book.volumeInfo.title;
                        const author = book.volumeInfo.authors.join(', ');
                        const image_url = book.volumeInfo.imageLinks.thumbnail;
                        const googleId = book.id;

                        try {
                            // Check if the book is already in the database
                            const existingBook = await db.oneOrNone('SELECT * FROM books WHERE googleBookId = $1', [googleId]);

                            if (!existingBook) {
                                // If the book doesn't exist, insert it into the books table
                                const insertedBook = await db.one('INSERT INTO books (author, title, image_url, googleBookId) VALUES ($1, $2, $3, $4) RETURNING *', 
                                [author, title, image_url, googleId]);

                                // Now you can use the insertedBook variable to get the details of the inserted book
                                console.log('Inserted Book:', insertedBook);

                                // If you want to associate the book with tags or perform other actions, you can do that here
                            } else {
                                // If the book already exists, you can handle it accordingly
                                console.log('Book already exists in the database:', existingBook);
                            }
                        } catch (error) {
                            console.error('Error inserting book:', error);
                            reject(error); // Reject the promise if there's an error
                        }
                    });
                    resolve(books);
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }
};