const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const cors = require('cors');

//Token
const {createToken, verifyToken} = require('../../Authentication/Token.js');

//validation
const {validateRegister, validateLogin} = require('../../Authentication/validateForm.js')

//Models
const User = require('../../models/User.js');
const Journal = require('../../models/Journal.js');
const Bank = require('../../models/Bank.js');

//Middleware
//router.use(cors())



// @route   POST api/login
router.post('/login', (req, res, next) => {
  console.log('Login POST request!');
  validateLogin(req.body, (err, user) => {
    if (err) {
      console.log(err);
      res.send({error: true, details: err, resetPwdField: true});
    } else {
      
      //validation passed, create token
      createToken(user, (token) => {

        //send response
        console.log('login succes!');
        res.send({error: false, username: user.username, token});
      });
    }
  });
});

// @route   POST api/register
router.post('/register', (req, res) => {
  console.log('Register POST request!');
  validateRegister(req.body, (err, user) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      
      //validation passed, create user and token

      //encrypt password
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          
          //create new user, along with bank and journal tables
          const newUser = new User(user);
          const newJournal = new Journal({userId: user.userId});
          const newBank = new Bank({userId: user.userId});
          Promise.all([newUser, newJournal, newBank].map(o => o.save())).then(([user, journal, bank]) => {
            console.log(`User ${user.userId} saved`);

            //create token

            createToken(user, (token) => {

              //send response
              console.log('register succes!');
              console.log({username:user.username});
              res.send({username: user.username, userId: user.userId, token});
            });
          })
          .catch((errs) => console.log('Error creating user tables: ' + errs));
        });
      });
    }
  });
});

module.exports = router;