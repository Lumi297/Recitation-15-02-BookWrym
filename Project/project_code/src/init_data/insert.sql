INSERT INTO users (username, password)  VALUES 
('Userman', '12345678');
INSERT INTO books (author, title, image_url,  goolgeBookId) VALUES 
('test1', 'book1', 'https://www.google.com/imgres?imgurl=https%3A%2F%2Ft3.ftcdn.net%2Fjpg%2F02%2F65%2F33%2F24%2F360_F_265332430_m9oF47TXuwy7JwCU2xIJYwvxbeYJBpmn.jpg&tbnid=maHvGa2FjwtVNM&vet=12ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX..i&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dvintage%2Bbook%2Bcover&docid=sYWsHlTCBn9OJM&w=546&h=360&q=stock%20book%20cover&ved=2ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX', 'blah1' ),
('test2', 'book2', 'https://www.google.com/imgres?imgurl=https%3A%2F%2Ft3.ftcdn.net%2Fjpg%2F02%2F65%2F33%2F24%2F360_F_265332430_m9oF47TXuwy7JwCU2xIJYwvxbeYJBpmn.jpg&tbnid=maHvGa2FjwtVNM&vet=12ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX..i&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dvintage%2Bbook%2Bcover&docid=sYWsHlTCBn9OJM&w=546&h=360&q=stock%20book%20cover&ved=2ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX', 'blah2' ),
('test3', 'book3', 'https://www.google.com/imgres?imgurl=https%3A%2F%2Ft3.ftcdn.net%2Fjpg%2F02%2F65%2F33%2F24%2F360_F_265332430_m9oF47TXuwy7JwCU2xIJYwvxbeYJBpmn.jpg&tbnid=maHvGa2FjwtVNM&vet=12ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX..i&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dvintage%2Bbook%2Bcover&docid=sYWsHlTCBn9OJM&w=546&h=360&q=stock%20book%20cover&ved=2ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX', 'blah3' ),
('test3', 'book4', 'https://www.google.com/imgres?imgurl=https%3A%2F%2Ft3.ftcdn.net%2Fjpg%2F02%2F65%2F33%2F24%2F360_F_265332430_m9oF47TXuwy7JwCU2xIJYwvxbeYJBpmn.jpg&tbnid=maHvGa2FjwtVNM&vet=12ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX..i&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dvintage%2Bbook%2Bcover&docid=sYWsHlTCBn9OJM&w=546&h=360&q=stock%20book%20cover&ved=2ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX', 'blah4' ),
('test3', 'book5', 'https://www.google.com/imgres?imgurl=https%3A%2F%2Ft3.ftcdn.net%2Fjpg%2F02%2F65%2F33%2F24%2F360_F_265332430_m9oF47TXuwy7JwCU2xIJYwvxbeYJBpmn.jpg&tbnid=maHvGa2FjwtVNM&vet=12ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX..i&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dvintage%2Bbook%2Bcover&docid=sYWsHlTCBn9OJM&w=546&h=360&q=stock%20book%20cover&ved=2ahUKEwiJoM6xrPeCAxVqx8kDHQ4MC8AQMygBegQIARBX', 'blah5' );


INSERT INTO users_to_books(username, bookId) VALUES
('Userman', 1),
('Userman', 2),
('Userman', 3),
('Userman', 4),
('Userman', 5); 
