const express = require('express');
const expressLayouts = require('express-ejs-layouts');
// Conectar a Mongo DB
const mongoose = require('mongoose');
const db = require('./config/keys').MongoURI;

mongoose.connect(db,{useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


const app = express();
//EJS
app.use(expressLayouts);
app.set('view engine','ejs');

// BodyParser
app.use(express.urlencoded({ extended: false}));


//Routes
app.use('/',require('./routes/index'))
app.use('/users',require('./routes/users'))


const PORT = process.env.PORT || 5000;

app.listen(PORT,console.log(`Server started on port ${PORT}`))