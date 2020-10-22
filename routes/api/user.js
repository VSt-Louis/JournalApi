const express = require('express');
const router = express.Router();

//user model
const User = require('../../models/User.js');

//Token
const {createToken, verifyToken} = require('../../Authentication/Token.js');

// @route   GET /:userId
router.get('/:userId', verifyToken, (req, res) => {
  console.log(`GET USER ID: ${req.params.userId}`);
  User.findOne({userId: req.params.userId}).then(user => {
    if (!user) {console.log('No users with that userId')}
    //this line removes the 'password' prop in the user object before sending it.
    const {['password']: _, ...safeUser} = user._doc;
    res.json(safeUser);
  }).catch(err => console.log(err));
});

module.exports = router;