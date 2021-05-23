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
    const { montIni,tasa} = req.body;
    let results = req.user.results;
    const r = montIni * tasa

    result ={
        montIni: montIni,
        tasa : tasa,
        resultado: r 
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