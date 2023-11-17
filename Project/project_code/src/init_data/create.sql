DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

-- following is for testing purposes only 
INSERT INTO users (username, password) VALUES ('John doe', '12345'); 