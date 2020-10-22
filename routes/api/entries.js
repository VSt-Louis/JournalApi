const express = require('express')
const router = express.Router();

//entry model
const User = require('../../models/User.js');
const Journal = require('../../models/Journal.js');

//Token
const {verifyToken} = require('../../Authentication/Token.js');

//get all entries
// @route   GET api/entries/:userId
router.get('/:userId', verifyToken, (req, res) => {
  console.log(`GET ENTRIES: ${req.params.userId}`);
  Journal.findOne({userId : req.params.userId})
  .then(journal => {
    if (!journal) {
      console.log(`Journal not found for user ${req.params.userId}, creating empty one.`);
      journal = new Journal({
        userId: req.params.userId
      });
      journal.save()
      .then(data => {res.json(data); console.log(JSON.stringify(data))})
      .catch(err => console.log(err));
    } else {
      res.json(journal.entries)
    }
  })
  .catch(err => console.log(err));
});

//update all entries
// @route   POST api/entries/:userId
router.post('/:userId', verifyToken, (req, res) => {
  console.log('POST ' + JSON.stringify(req.body));
  Journal.findOne({userId : req.params.userId})
  .then(journal => {
    if (!journal) {
      console.log(`Journal not found for user ${req.params.userId}, creating empty one.`)
      journal = new Journal({
        userId: req.params.userId,
        entries: req.body.entries || []
      });
    }
    console.log(`Updating user`);

    //update data
    if (req.body.entries) journal.entries = req.body.entries;
    journal.markModified('entries');
    journal.save()
    .then(data => {res.json(data); console.log(JSON.stringify(data))})
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
});

module.exports = router;