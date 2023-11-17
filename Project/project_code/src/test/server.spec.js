// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case
  //
  //Positive cases (login-GET)
  it('positive : /login', done => {
      chai
        .request(server)
        .get('/login')
        // .send() // sending is meant for posting data 
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
  // negative cases (login-GET )
  //We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 200 along with a "Invalid input" message.
  it('Negative : /login. Checking page render', done => {
    chai
      .request(server)
      .get('/login')
      // .send()
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  // To play it safe, let's do POST routes for log in
  // positive case (Login-POST)
  it('positive; login successful', done => {
    chai
      .request(server)
      .send({username:'John doe', password:'12345'}) // critical to send a json object with the correct credentials
      .end((err, res) => {
        expect(res).to.have.status(200);
        done(); 
      });
  });
  // negative case (Login-POSt)
  it('negative: /login. Checking for invalid password', done => {
    chai
      .request(server)
      .send({username:'John doe', password:'password'})
      .end((err, res) => {
        expect(res).to.have.status(400); // not sure I remember the correct code for this, point is that it's wrong 
        done();
      });
  });

  // login is out of the way, let's write a few test cases for register, 
  //  get functions might be a little redundant, so these will be checking the post route - Brandon 
  it('positive: /register. checking for succesful addition', done => {
    chai 
    .request(server)
    .send({username:'test',password:'password'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      done();
    });


  }); 

  // not sure where this would go wrong potentially, but adding a negative on register (maybe we check and see if the user already exists in the DB? )
  // negative 
  it('negative: /register. checking for register failure ', done => {
      chai
      .request(server)
      .send({username: 'test', password:'password'})
      .end((err,res)=>{
        expect(res).to.have.status(400);
        done();
      });
  });