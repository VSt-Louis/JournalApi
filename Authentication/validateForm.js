const User = require('../models/User.js');
const bcrypt = require('bcryptjs');

//Exports

const validateRegister = (fields, cb) => {
  const {username, name, email, password, password2} = fields;
    let error = '';
    
    //check all fields
    if (
      !username || !name || !email || !password || !password2 || //all fields
      password !== password2 || //pwd match
      [username, name, email, password, password2].some(str => str.length > 512) //max length
    ) {
        cb('Form data recieved was invalid');
      } else {
        //check if username exists
        User.findOne({username})
          .then(user => {
            if (user) {
              
              //callback
              cb('Username already taken.');
            } else {
              
              //everything is ok
              
              console.log(username)
              
              cb(null, {
                userId: username,
                username,
                name,
                email,
                password,
              });
            }
          });
  }
}

const validateLogin = (fields, cb) => {
  const {username, password} = fields;
  console.log(fields)
  //check fields
  if (!username || !password) {
    cb('All fields are required.')
  } else {
    //check if user exists
    User.findOne({username})
      .then(user => {
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              console.log('passwords match')
              cb(null, user);
            } else {
              cb('Password incorrect.');
            }
          });
        })
      .catch(err => {
        cb('Username is not registered.');
      });
  }
}



module.exports = {validateRegister, validateLogin}