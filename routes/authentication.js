var db = require('../api/db.js');
var Users = db.import(__dirname+'/../models/users.js');
var bcrypt = require('bcrypt');

exports.login = function(req, res){
  var email = req.body.email;
  var pwd = req.body.password;
  console.log(req.body);
  req.session.loggedIn = false;
  req.session.incorrectCredentials = false;
  req.session.accountDoesNotExist = false;
  Users.retrieveUser(email, function(err, data){
    if(err) throw err;

    // account exists
    if(data !== null) {
      bcrypt.compare(pwd, data.passwordHash, function(e, d){
        // password is correct
        if(d === true){
          req.session.loggedIn = true;
          req.session.currentUser = data;
          res.redirect('/home');
        }
        else if(d === false){
          req.session.incorrectCredentials = true;
          res.redirect('/acccessTheLoginHomie');
        }
      });
    }

    // account does not exist
    else if(data === null){
      // req.session.loggedIn = false;
      req.session.accountDoesNotExist = true;
      res.redirect('/acccessTheLoginHomie');
    }
  });
};

exports.create = function(req, res){
  var email = req.body.email;
  var pwd = req.body.password;
  req.session.loggedIn = false;
  Users.newUser(null, null, email, pwd, function(err, data){
    if(err && err.message && err.message === 'duplicate key value violates unique constraint "Users_email_key"'){
      req.session.accountAlreadyExists = true;
      res.redirect('/acccessTheLoginHomie');
    }
    else{
      req.session.loggedIn = true;
      res.redirect('/home');
    }
  });
};