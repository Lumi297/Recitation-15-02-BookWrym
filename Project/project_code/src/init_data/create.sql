DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

-- following is for testing purposes only 
INSERT INTO users (username, password) VALUES ('John doe', '12345'); 

-- going to create a users table with username and password 
-- following additional characters are going to exist: 
-- tags, books, and the joining tables for all of them 
CREATE  TABLE IF  NOT EXISTS books (
    bookId PRIMARY KEY,
    author VARCHAR(100),
    title VARCHAR(100), 
    image_url VARCHAR(100), 
);
-- think the tags won't need anything else? 
CREATE TABLE IF NOT EXISTS tags (
    tagId SERIAL PRIMARY KEY, 
    name VARCHAR(100), 
);

CREATE TABLE IF NOT EXISTS reviews(
    reviewId SERIAL PRIMARY KEY,
    rating INT,
    body VARCHAR(500),
)
-- two tables below exist to help collect joins together based on the majority of the work put in. 
CREATE TABLE IF NOT EXISTS users_to_books (
    username varchar(100) NOT NULL, 
    bookId INT NOT NULL, 
    FOREIGN KEY(username) REFERENCES users(username),
    FOREIGN KEY(bookId) REFERENCES books(bookId),
); 

CREATE TABLE IF NOT EXISTS tags_to_books (
    tagId INT NOT NULL, 
    bookId INT NOT NULL, 
    FOREIGN KEY (tagId) REFERENCES tags(tagId),
    FOREIGN KEY (bookId) REFERENCES books(bookId),
); 

CREATE TABLE IF NOT EXISTS reviews_to_books(
    reviewId INT NOT NULL,
    bookId INT NOT NULL,
    FOREIGN KEY(bookId) REFERENCES books(bookId),
    FOREIGN KEY(reviewId) REFERENCES reviews(reviewId),
)

CREATE TABLE IF NOT EXISTS users_to_reviews(
    username VARCHAR(100) NOT NULL,
    reviewId INT NOT NULL,
    FOREIGN KEY(username) REFERENCES users(username),
    FOREIGN KEY(reviewId) REFERENCES reviews(reviewId).
)

-- going to create a users table with username and password 
-- following additional characters are going to exist: 
-- tags, books, and the joining tables for all of them 
CREATE  TABLE IF  NOT EXISTS books (
    bookId PRIMARY KEY,
    author VARCHAR(100),
    title VARCHAR(100), 
    image_url VARCHAR(100), 
);
-- think the tags won't need anything else? 
CREATE TABLE IF NOT EXISTS tags (
    tagId SERIAL PRIMARY KEY, 
    name VARCHAR(100), 
);
-- two tables below exist to help collect joins together based on the majority of the work put in. 
CREATE TABLE IF NOT EXISTS users_to_books (
    username varchar(100) NOT NULL, 
    bookId INT NOT NULL, 
    FOREIGN KEY(username) REFERENCES users(username),
    FOREIGN KEY(bookId) REFERENCES books(bookId)
); 

CREATE TABLE IF NOT EXISTS tags_to_books (
    tagId INT NOT NULL, 
    bookId INT NOT NULL, 
    FOREIGN KEY (tagId) REFERENCES tags(tagId),
    FOREIGN KEY (bookId) REFERENCES books(bookId),
); 
