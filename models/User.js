const mongoose = require('mongoose');


const resultsSchema = new mongoose.Schema({ 
    TCE: Number,
    tasaDes:Number,
    valNom:Number,
    des:Number,
    valNeto:Number,
    valRec:Number,
    ValEnt: Number,
    ret:Number,
    fIni: String,
    fVen: String,
    fDes:String,
    dias: Number,
    tasa:Number,
    tipoTasa:String,
    tPeriodo:Number,
    tPeriodoCap:Number,
    
});

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
    results: [resultsSchema],
    date:{
        type:Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;