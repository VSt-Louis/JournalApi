const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors');

const userBase = require('./routes/api/userBase');
const user = require('./routes/api/user');
const entries = require('./routes/api/entries');
const bank = require('./routes/api/bank');

const app = express();

//Middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

//db config and connect
const db = require('./config/keys').databaseURI;

mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
.then(() => console.log(`Mongo connected
====================



`))
.catch(err => console.log('Mongo connect ERROR: ' + err));

//routes
app.use('/api', userBase);
app.use('/api/user', user);
app.use('/api/entries', entries);
app.use('/api/bank', bank);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server started on port ${port}`));