
const jwt = require('jsonwebtoken');
const jwtSecret = require('./config/keys').jwtSecret;


const createToken = (user, callback) => {
  console.log(user)
  jwt.sign({user}, jwtSecret, (err, token) => {
    callback(token);
  });
}

const verifyToken = (req, res, next) => { //express middleware
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader === undefined) {
    //forbidden
    console.log('No token found in header');
    res.status(403).send('This route is protected, please login');
  } else {
    const userId = req.params.userId;
    const token = bearerHeader.split(' ')[1];
    
    jwt.verify(token, jwtSecret, (err, data) => {
      if (err) {
        console.log(err)
        res.status(403).send('This route is protected, please login');
      } else {
        console.log(data)
        next();
      }
    });
  }
} 


module.exports = {createToken, verifyToken};