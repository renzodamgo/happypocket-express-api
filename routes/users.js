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
    const { dni,name,last_name,email,cel,dir, password, password2 } = req.body;
    let errors = [];
  
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Contraseñas no son iguales' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        dni,
        name,
        last_name,
        email,
        cel,
        dir,
        password,
        password2
      })
    }else{
        // Validation passed
        User.findOne({
          email:email })
          .then(user => {
            if(user){
              // User existe
              errors.push({msg: 'Email ya esta registrado'});
              res.render('register', {
                errors,
                dni,
                name,
                last_name,
                email,
                cel,
                dir,
                password,
                password2
              })
            }
          })
        

        User.findOne({
          dni:dni })
          .then(user => {
            if(user){
              // User existe
              errors.push({msg: 'DNI ya esta registrado'});
              res.render('register', {
                errors,
                dni,
                name,
                last_name,
                email,
                cel,
                dir,
                password,
                password2
              })
            } else{
              const newUser = new User({
                dni,
                name,
                last_name,
                email,
                cel,
                dir,
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
router.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req,res,next);
});

//Logiut
router.get('/logout',(req,res)=>{
  req.logOut();
  req.flash('success_msg','Haz cerrado sesión.');
  res.redirect('/users/login')
})

module.exports = router;