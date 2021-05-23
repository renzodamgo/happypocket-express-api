const e = require('express');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
// User model
const User = require('../models/User');
//Login Page
router.get('/login',(req,res) => res.render('login'))

// Register Page
router.get('/register',(req,res) => res.render('register'))

//Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
  
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      })
    }else{
        // Validation passed
        User.findOne({email:email})
          .then(user => {
            if(user){
              // User existe
              errors.push({msg: 'Email ya esta registrado'});
              res.render('register', {
                errors,
                name,
                email,
                password,
                password2
              })
            } else{
              const newUser = new User({
                name,
                email,
                password,
              });
              
              // Hash Pasword
              bcrypt.genSalt(10,(err,salt)=> 
                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                  if(err) throw err;
                  newUser.password = hash;
                  newUser.save()
                    .then(user =>{
                      req.flash('success_msg','Ahora estas registrado y puedes iniciar sesion')
                      res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
              }));
            }
          });
    }
});

//Login Handle
router.post('/login',(req,res)=>{
  passport.authenticate('local',{
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req,res,next);
});
module.exports = router;