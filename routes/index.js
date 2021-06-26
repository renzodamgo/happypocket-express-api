const express = require('express');
const router = express.Router();
const { ensureAuthenticated} = require('../config/auth');
//Welcome Page

router.get('/',(req,res) => res.render('welcome'));

router.get('/dashboard',ensureAuthenticated ,(req,res) => 
res.render('dashboard',{
    name: req.user.name,
    results: req.user.results
}));

// LOGICA DEL TCEA
router.post('/dashboard',ensureAuthenticated ,(req,res) => {
    //-------Datos de entrada-------
    const { valNom,tasa,tPeriodo,nDias} = req.body;
    // let results = req.user.results;
    let results = [];
    
    
    //-------Datos intemedios-------
    //Tiempo: t
    //Calcular TASA: tea
    
    let TEP = ((1+ tasa/100)**(nDias/tPeriodo)) -1
    let d = (TEP/(1+TEP))
    let des = valNom * d
    valNeto = valNom - des
    
    console.log(tasa,nDias,tPeriodo)

    //-------Datos de salida-------
    let result ={
        TCE: TEP,
        tasaDes:d,
        valNom:valNom,
        des:des,
        valNeto:valNeto
    }

    results.push(result)
    console.log(result)
    req.user.results = results;
    req.user.save();
    res.render('dashboard',{
        results : results,
        name: req.user.name,
    })
});

module.exports = router;