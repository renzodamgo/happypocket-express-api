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

function convertirTNaTEP(TN, P, capitalizacion, periodo){
//   """
//   Entradas:
//   > TN: Tasa Nominal 'P' de capitalización '?'
//   > P: Periodo de la Tasa Nominal, en días (Ej: Anual -> 360; Mensual -> 30)
//   > capitalizacion: Capitalización, en días (Ej: Diaria -> 1; mensual -> 30; etc)
//   > periodo: Periodo objetivo de la Tasa Efectiva del Periodo
//   Salida: TEP equivalente a la TNP
//   """
  if (TN > 1) {
    TN = TN / 100
  }
  n = periodo / capitalizacion
  m = P / capitalizacion
  i = TN/m
  return pow(1 + i, n) - 1
}

// LOGICA DEL TCEA
router.post('/dashboard',ensureAuthenticated ,(req,res) => {
    //-------Datos de entrada-------
    const { valNom,tasa,tPeriodo,fIni,fVen,tPeriodoCap,tipoTasa} = req.body;
    let results = req.user.results;
    //-------Datos intemedios-------

    //Tiempo: t
    const dateIni = Date.parse(fIni)
    const dateVen = Date.parse(fVen)
    const t = Math.abs(dateIni- dateVen)/(24*3600*1000);
    console.log(fIni,fVen,t,tPeriodoCap,tipoTasa)

    //Calcular TASA: 
    //Si es Tasa Nominal
    if(tipoTasa == 'efectiva'){
        let tasa = convertirTNaTEP(tasa,tPeriodo,tPeriodoCap,360)
        let TEP = ((1+ tasa/100)**(t/360)) -1
    }
    //Si es Tasa Efectiva
    if(tipoTasa == 'nominal'){
        let TEP = ((1+ tasa/100)**(t/tPeriodo)) -1
        let d = (TEP/(1+TEP))
        let des = valNom * d
        valNeto = valNom - des
    }
    console.log(tasa,t,tPeriodo)

    //-------Datos de salida-------
    let result ={
        TCE: TEP,
        tasaDes:d,
        valNom:Number(valNom),
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