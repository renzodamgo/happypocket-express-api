const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model

const User = require('../models/User');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({ usernameField: 'email'}, (email, password,done)=>{
            User.findOne({email : email})
                .then(user=>{
                    if(!user){
                        return done(null, false,{message: 'El email no esta registrado'});
                    }
                  bcrypt.compare(password,user.password,(err, isMatch)=>{
                    if (isMatch){
                        return done(null,user);
                    }else{
                        return done(null,false,{message: 'Contraseña equivocada.'})
                    }
                  });  
                })
                .catch(err => console.log(err));
        })
    )

    passport.serializeUser((user,done)=>{
        done(null, user.id);
    });

    passport.deserializeUser((id,done)=>{
        User.findById(id,function(err, user){
            done(err,user);
        })
    })
}