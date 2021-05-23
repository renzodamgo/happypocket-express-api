const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model

const User = require('../models/User');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({ usernameField: 'dni'}, (dni, password,done)=>{
            User.findOne({dni : dni})
                .then(user=>{
                    if(!user){
                        return done(null, false,{message: 'El DNI no esta registrado'});
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