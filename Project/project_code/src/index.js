
// dummy route for testing and lab 11 purposes
app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });
