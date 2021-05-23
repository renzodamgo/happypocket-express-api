const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    dni:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    last_name:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    cel:{
        type:Number,
        required: false
    },
    dir:{
        type:String,
        required: false
    },
    password:{
        type:String,
        required: true
    },
    results: [Number],
    date:{
        type:Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;