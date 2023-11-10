
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
        res.redirect('/discover');
      }

    }).catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});


// for testing purposes, leaving this here 
module.exports = app.listen(3000);