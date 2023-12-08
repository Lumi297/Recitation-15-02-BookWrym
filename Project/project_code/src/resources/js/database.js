// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bcrypt = require('bcrypt'); //  To hash passwords
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

async function addCategoryToBook(bookId, category) {
    try {
        if (category) {

            // Check if the category already exists in the tags table
            const existingTag = await db.oneOrNone('SELECT * FROM tags WHERE name = $1', [category]);

            let tagId;
            if (!existingTag) {
                // If the category doesn't exist, insert it into the tags table
                const insertedTag = await db.one('INSERT INTO tags (name) VALUES ($1) RETURNING tagId', [category]);
                tagId = insertedTag.tagid;
            } else {
                tagId = existingTag.tagid;
            }

            // Connect the book with the category in the tags_to_books table
            await db.none('INSERT INTO tags_to_books (tagId, bookId) VALUES ($1, $2)', [tagId, bookId]);

        }
    } catch (error) {
        console.error('Error adding categories to book:', error);
        throw error;
    }
}

/**
 * Adds item to users_to_books table.
 * @param {string} googleBookId - The Google Book ID.
 * @param {string} username - The username.
 * @returns {Promise<void>} 
 */
async function addBookToUser(googleBookId, username) {
    try {
        // Find the corresponding bookId for the given googleBookId
        const book = await db.oneOrNone('SELECT bookId FROM books WHERE googleBookId = $1', [googleBookId]);

        if (book) {
            // Check if the entry already exists in users_to_books
            const existingEntry = await db.oneOrNone('SELECT * FROM users_to_books WHERE username = $1 AND bookId = $2', [username, book.bookid]);

            if (!existingEntry) {
                // Insert the book into the users_to_books table
                await db.none('INSERT INTO users_to_books (username, bookId) VALUES ($1, $2)', [username, book.bookid]);
            }
        } else {
            console.error('Book with Google Book ID not found:', googleBookId);
        }
    } catch (error) {
        console.error('Error adding book to user:', error);
        throw error;
    }
}

/**
 * searches tags_to_books to find all tags relevant to one section or another 
 * @param {int} googleBookId - using book id for now to send tings back
 * @return {promise<JSON[]>} similarBooks - returns a JSON array of books   
 */
async function getTagsbyBook(googleBookId) {
    try {
        const query = `SELECT * FROM tags INNER JOIN tags_to_books ON tags.tagId = tags_to_books.tagId INNER JOIN books ON tags_to_books.bookId = books.bookId WHERE books.googleBookId = '${googleBookId}'`;
        const results = await db.any(query);
        return results;
    } catch (error) {
        console.error('problem loading tags for this book', error);
        return ["No Tags"];
    }
}

/**
 * Searches users_to_books and returns list of GoogleBookIds
 * @param {string} username - User's username.
 * @return {Promise<string[]>} - Resolves with an array of GoogleBookIds.
 */
async function getUserBookIds(username) {
    try {
        // Query the users_to_books table for books associated with the user
        const userBooks = await db.any('SELECT bookId FROM users_to_books WHERE username = $1', [username]);

        // Map the bookIds to corresponding googleBookIds
        const googleBookIds = await Promise.all(userBooks.map(async (book) => {
            const bookDetails = await db.one('SELECT googleBookId FROM books WHERE bookId = $1', [book.bookid]);
            return bookDetails.googlebookid;
        }));

        return googleBookIds;
    } catch (error) {
        console.error('Error getting user books:', error);
        throw error;
    }
}

/**
 * uses google books api in order to return json object
 * @param {string} googleBookId 
 */
function getBook(googleBookId) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBookId}`);
            resolve(response.data);
        } catch (error) {
            console.error('Error getting book details:', error);
            reject(error);
        }
    });
}

/**
 *  getBooksbyTag queries our data base and searches for 5 google book ID's that correspond with a given tag. 
 * @param {*} query 
 * @param {*} numResults 
 * @returns {promise<string[]>} an array of GoogleBookIDs
 */
async function getBooksbyTag(subject, numResults) {
    try {
        // Query database to return <numResults> distinct GoogleBookIDs with the specified tag
        const query = `SELECT DISTINCT b.googleBookId FROM tags_to_books tb JOIN tags t ON tb.tagId = t.tagId JOIN books b ON tb.bookId = b.bookId WHERE t.name = $1 LIMIT $2;`;

        const results = await db.any(query, [subject, numResults]);
        return results;
    } catch (error) {
        console.error('Problem getting GoogleBookIds by tag:', error);
        throw error;
    }
}

/**
     * Searches for matching results using books API, loads data into DB, then returns JSON object
     * @param {String} query
     * @param {Number} numResults
     * @returns {Promise<JSON>}
     */
function getBooks(query, numResults) {
    return new Promise((resolve, reject) => {
        axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${numResults}`)
            .then(async results => {
                const books = results.data.items;
                //add book info to database
                for (const book of books) {
                    const title = book.volumeInfo.title;
                    var author;
                    try{
                        author = book.volumeInfo.authors.join(', ');
                    }
                    catch{
                        console.log("No author found for book: "+title);
                        author="No Author Found";
                    }
                    var image_url = 'No Image URL';
                    try {
                        image_url = book.volumeInfo.imageLinks.thumbnail;
                    }
                    catch {
                        console.log("No Image URL found for book: " + title);
                    }
                    const googleId = book.id;
                    var categories = [];
                    try {
                        categories = book.volumeInfo.categories;
                        categories[0];
                    }
                    catch {
                        console.log("No categories for book: " + title);
                        categories = ["No Genre"];
                    }

                    try {
                        // Check if the book is already in the database
                        const existingBook = await db.oneOrNone('SELECT * FROM books WHERE googleBookId = $1', [googleId]);

                        if (!existingBook) {
                            // If the book doesn't exist, insert it into the books table
                            const insertedBook = await db.one('INSERT INTO books (author, title, image_url, googleBookId) VALUES ($1, $2, $3, $4) RETURNING *',
                                [author, title, image_url, googleId]);

                            //add and connect categories to book
                            await addCategoryToBook(insertedBook.bookid, categories[0]);
                        } else {
                            // If the book already exists, handle it accordingly
                            await addCategoryToBook(existingBook.bookid, categories[0]);
                        }
                    } catch (error) {
                        console.error('Error inserting book:', error);
                    }
                }
                resolve(books);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

function register(username, hash) {
    return new Promise((resolve, reject) => {
        const submission = `INSERT INTO users (username, password) VALUES( '${username}', '${hash}') RETURNING *`;

        db.oneOrNone(submission)
            .then((user) => {
                if (user) {
                    console.log(user);
                    // User successfully registered
                    resolve(user);
                } else {
                    // Registration failed (user with the same username might already exist)
                    reject(new Error('User registration failed'));
                }
            })
            .catch((error) => {
                // Handle any database-related errors
                reject(error);
            });
    });
}

/**
   * Authenticates a user by checking the provided username and password against the database.
   * @param {String} username - The username to check.
   * @param {String} password - The password to check.
   * @returns {Promise<JSON>} - Resolves with user information if authentication is successful.
   */
function login(username, password) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE username = '${username}'`;

        db.oneOrNone(query)
            .then((user) => {
                if (user && bcrypt.compareSync(password, user.password)) {
                    // Passwords match, user authenticated
                    resolve(user);
                } else {
                    // Either user not found or password doesn't match
                    reject(new Error('Invalid username or password'));
                }
            })
            .catch((error) => {
                // Handle any database-related errors
                reject(error);
            });
    });
}

module.exports = {
    getBooks: getBooks,
    register: register,
    login: login,
    getBook: getBook,
    getTagsbyBook: getTagsbyBook,
    getBooksbyTag: getBooksbyTag,
    getUserBookIds: getUserBookIds,
    addBooktoUser: addBookToUser
};