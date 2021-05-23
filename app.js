const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash')
const session = require('express-session')
// Conectar a Mongo DB
const mongoose = require('mongoose');
const db = require('./config/keys').MongoURI;
const passport = require('passport');

require('./config/passport')(passport);


mongoose.connect(db,{useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));



const app = express();
//EJS
app.use(expressLayouts);
app.set('view engine','ejs');

// BodyParser
app.use(express.urlencoded({ extended: false}));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Connect flash
app.use(flash());

//Global Vars
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});


//Routes
app.use('/',require('./routes/index'))
app.use('/users',require('./routes/users'))


const PORT = process.env.PORT || 5000;

app.listen(PORT,console.log(`Server started on port ${PORT}`))