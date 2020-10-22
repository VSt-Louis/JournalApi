const express = require('express');
const router = express.Router();
const uid = require('uniqid');
const queue = require('express-queue');


//user model
const User = require('../../models/User.js');
const Bank = require('../../models/Bank.js');

//Token
const {createToken, verifyToken} = require('../../Authentication/Token.js');

//Queue config
const configQueue = queue({ activeLimit: 1, queuedLimit: -1 })

// @route   GET /:userId
router.get('/:userId', verifyToken, configQueue, (req, res) => {
  let userId = req.params.userId
  
  //error handling
  let errors = [];
  const handleErrors = () => {
    if (errors.length > 0) {
      console.log(errors)
      res.status(400).json(errors);
    }
  }

  console.log(`GET bank for: ${userId}`);
  const bankHeader = req.headers['bank'];
  if (bankHeader == undefined || typeof bankHeader != 'string') {
    errors.push('000 Bank header was not provided');
  }
  
  let bankReq = bankHeader.split(' ')
  console.log(bankReq)
  
  if (!['transfer', 'accept', 'statement'].includes(bankReq[0])) {
    errors.push(`001 Bank header syntax is incorrect (unknown command: ${bankReq[0]})`);
  }
  handleErrors();
  
  let responseSent = false;
  
  if (bankReq[0] == 'transfer') {
    
    //[transfer, bigjoe, 20]
    let [targetId, amount] = bankReq.splice(1);
    
    if (targetId && amount) {
      
      Bank.findOne({userId}).then(user => {
        if (user) {
          if (user.data.bank) {
            
            //Target
            Bank.findOne({userId: targetId}).then(target => {
              if (target) {
                console.log('target found')
                if (target.data.bank) {

                  //create unique id for the request
                  let reqId = uid('bankreq-') 

                  //create transaction as pending to user's history
                  let transaction = {
                    from: userId,
                    to: targetId,
                    amount,
                    status:"pending",
                    date: new Date().toJSON(),
                    id: reqId
                  }
                  
                  //add to user's history
                  user.data.bank.history.push(transaction);
                  
                  //add to target's pending transfers
                  target.data.bank.pending_transfers.push(transaction);
                  
                  //mongoose updating trick
                  user.markModified('data');
                  user.save();

                  target.markModified('data');
                  target.save().then(() => {
                    //send response
                    res.status(200).send('Requests sent successfully');
                  });

                  
                } else {
                  errors.push('005 Target\'s bank info corrupted');
                }
              } else {
                errors.push('003 Target not found');
              }
            }).catch(err => {
              errors.push(`Error in Target block, error: ${err}`);
            }).finally(() => {
              handleErrors()
            });
          } else {
            errors.push('004 User\'s bank info corrupted');
          }
        } else {
          errors.push('002 User not found');
        }
      }).catch(err => {
        errors.push(`Error in User block, error: ${err}`);
      }).finally(() => {
        handleErrors()
      });
    } else {
      errors.push('001 Bank header syntax is incorrect');
    }
    handleErrors();
  }
  
  if (bankReq[0] == 'accept') {
    
    //[accept, bankreq-aj23j34l, true]
    let [id, accept] = bankReq.splice(1);
    
    if (id && accept) {
      Bank.findOne({userId}).then(user => {
        
        if (user) {
          
          if (user.data.bank) {
            let request = user.data.bank.pending_transfers.find(req => req.id == id);

            if (request) {
              Bank.findOne({userId: request.from}).then(target => {
                
                if (target) {
                  
                  //remove original request
                  user.data.bank.pending_transfers = user.data.bank.pending_transfers.filter(req => req.id != id)
                  user.data.bank.history = user.data.bank.history.filter(transaction => transaction.id != id);
                  target.data.bank.history = user.data.bank.history.filter(transaction => transaction.id != id);
                  
                  console.log(user.data.bank.pending_transfers)
                  
                  let message;
                  if (accept == 'true') {
                    
                    //update amounts
                    user.data.bank.balance = Number(user.data.bank.balance) + Number(request.amount);
                    target.data.bank.balance = Number(target.data.bank.balance) - Number(request.amount);
                    
                    //update status
                    user.data.bank.history.push({...request, status: 'accepted'});
                    target.data.bank.history.push({...request, status: 'accepted'});
                    
                    message = 'Transfer was succesfully accepted'
                  } else {
                    
                    //update status
                    user.data.bank.history.push({...request, status: 'denied'});
                    
                    message = 'Transfer was denied by target';
                  }
                  
                  //mongoose updating trick
                  console.log(message + ' id: ' + id)
                  user.markModified('data');
                  target.markModified('data');
                  user.save().then(() => {
                    target.save().then(() => {
                      res.status(200).send(message);
                    });
                  });

                } else {
                  errors.push('003 Target not found');
                }
              }).catch(err => {
                errors.push(`Error in Target block, error: ${err}`);
              });
            } else {
              errors.push('006 request does not exist for user');
            }
          } else {
            errors.push('004 User\'s bank info corrupted');
          }
        } else {
          errors.push('002 User not found');
        }
      }).catch(err => {
        errors.push(`Error in User block, error: ${err}`);
      }).finally(() => {
        handleErrors()
      });
    } else {
      errors.push('001 Bank header syntax is incorrect');
    }
    handleErrors();
  }
  
  if (bankReq[0] == 'statement') {
    Bank.findOne({userId}).then(user => {
      if (user) {
        res.status(200).json(user.bank);
      } else {
        errors.push('002 User not found');
      }
    }).catch(err => {
      errors.push(`Error in User block, error: ${err}`);
    }).finally(() => {
      handleErrors()
    });
  }
});

module.exports = router;