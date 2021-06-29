const express = require('express');
const router = express.Router();
const { ensureAuthenticated} = require('../config/auth');
//Welcome Page
let costesIni = [];
let costesFin = [];
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

router.post('/dashboard/inicial',ensureAuthenticated ,(req,res) => {
    const { costIni,costName} = req.body;
    costIniData = {
        nombre:costName ,
        comision:costIni,
    }
    console.log(costIniData)
    costesIni.push(costIniData)
    res.render('dashboard',{
        name: req.user.name,
        costInis: costesIni,
        costFins: costesFin,
    })
    
});

router.post('/dashboard/final',ensureAuthenticated ,(req,res) => {
    const { costFin,costName} = req.body;
    costFinData = {
        nombre:costName ,
        comision:costFin,
    }
    console.log(costFinData)
    costesFin.push(costFinData)
    res.render('dashboard',{
        name: req.user.name,
        costFins: costesFin,
        costInis: costesIni,
    })
   
});


// LOGICA DEL TCEA
router.post('/dashboard',ensureAuthenticated ,(req,res) => {
    //-------Datos de entrada-------
    const { valNom,tasa,tPeriodo,fIni,fVen,fDes,tPeriodoCap,tipoTasa,ret} = req.body;
    let results = req.user.results;
    
    //-------Datos intemedios-------

    //Tiempo: t
    const dateIni = Date.parse(fDes)
    const dateVen = Date.parse(fVen)
    const t = Math.abs(dateIni- dateVen)/(24*3600*1000);
    console.log(fIni,fVen,t,tPeriodoCap,tipoTasa)
    let TEP
    //Calcular TASA: 
    //Si es Tasa Nominal
    if(tipoTasa == 'efectiva'){
        TEP = ((1+ tasa/100)**(t/360)) -1
    }
    //Si es Tasa Efectiva
    if(tipoTasa == 'nominal'){
        tasa = convertirTNaTEP(tasa,tPeriodo,tPeriodoCap,360)
        TEP = ((1+ tasa/100)**(t/tPeriodo)) -1
    }
    
    let costIniciales = 0
    let costFinales = 0

    costesIni.forEach(function(costIni){
        costIniciales = costIniciales + costIni.comision;
    })

    costesFin.forEach(function(costFin){
        costFinales = costFinales + Number(costFin.comision);
    })

    let d = (TEP/(1+TEP))
    let des = valNom * d
    valNeto = valNom - des
    let valRec = valNeto - ret - costIniciales
    let valEnt = Number(valNom) + costFinales - ret
    console.log(tasa,t,tPeriodo)
    console.log(Number(valNom),costFinales,ret)
    //-------Datos de salida-------
    let result ={
        TCE: TEP,
        tasaDes:d,
        valNom:Number(valNom),
        des:des,
        valNeto:valNeto,
        valRec:valRec,
        valEnt:valEnt
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