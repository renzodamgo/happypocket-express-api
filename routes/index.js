const express = require('express');
const router = express.Router();
const { ensureAuthenticated} = require('../config/auth');
//Welcome Page
let costesIni = [];
let costesFin = [];
let result = {
    TCE: undefined,
    tasaDes:undefined,
    valNom:undefined,
    des:undefined,
    valNeto:undefined,
    valRec:undefined,
    valEnt:undefined
}



router.get('/',(req,res) => res.render('welcome'));

router.get('/cartera',ensureAuthenticated,(req,res) => 
res.render('cartera',{
    results: req.user.results,
    name: req.user.name,
}))

router.get('/dashboard',ensureAuthenticated ,(req,res) => 
res.render('dashboard',{
    name: req.user.name,
    results: req.user.results,
    result:result
}));

router.post('/dashboard/save',ensureAuthenticated ,(req,res) => {
    let results = req.user.results;
    
    results.push(result)
    console.log("--------------")
    console.log(result)
    req.user.results = results;
    req.user.save();
    res.render('dashboard',{
        costFins: costesFin,
        costInis: costesIni,
        results : results,
        name: req.user.name,
        result:result
    })
});

router.post('/dashboard/delete',ensureAuthenticated ,(req,res) => {
    result = {
        TCE: undefined,
        tasaDes:undefined,
        valNom:undefined,
        des:undefined,
        valNeto:undefined,
        valRec:undefined,
        valEnt:undefined
    }
    let results = req.user.results;
    costesIni = [];
    costesFin = []; 
    res.render('dashboard',{
        costFins: costesFin,
        costInis: costesIni,
        results : results,
        name: req.user.name,
        result: result
    })
});


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
  return Math.pow(1 + i, n) - 1
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
        result: result,
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
        result: result,
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
        TEP = ((1+ tasa/100)**(t/tPeriodo)) -1
    }
    //Si es Tasa Efectiva
    if(tipoTasa == 'nominal'){
        tasa2 = convertirTNaTEP(tasa,tPeriodo,tPeriodoCap,tPeriodoCap)
        TEP = ((1+ tasa2)**(t/tPeriodoCap)) -1
    }
    console.log("tasa efectiva: " ,tasa2,TEP,t ,tPeriodoCap)
    //Costos Iniciales y Finales
    let costIniciales = 0
    let costFinales = 0

    costesIni.forEach(function(costIni){
        costIniciales = costIniciales + costIni.comision;
    })

    costesFin.forEach(function(costFin){
        costFinales = costFinales + Number(costFin.comision);
    })
    //Tasa Descontada
    let d = (TEP/(1+TEP))
    //Descuento
    let des = valNom * d
    //Valor Neto
    valNeto = valNom - des
    // Valor Recibido
    let valRec = valNeto - ret - costIniciales
    //Valor Entregado
    let valEnt = Number(valNom) + costFinales - ret
    let TCEA = ((valEnt/valRec)**(360/t))-1
    //TCEA
    console.log(tasa,t,tPeriodo)
    console.log(Number(valNom),costFinales,ret)
    //-------Datos de salida-------
    
    result ={
        TCE: TCEA,
        TEP: TEP,
        tasaDes:d,
        valNom:Number(valNom),
        des:des,
        valNeto:valNeto,
        valRec:valRec,
        valEnt:valEnt,
        ret:ret,
        fIni:fIni,
        fVen:fVen,
        fDes:fDes,
        dias: t,
        tasa:tasa,
        tipoTasa:tipoTasa,
        tPeriodo:tPeriodo,
        tPeriodoCap:tPeriodoCap,
        costIniciales:costFinales,
        costFinales:costFinales,

    }

    // results.push(result)
    console.log("===Post==")
    console.log(result)
    // req.user.results = results;
    // req.user.save();
    res.render('dashboard',{
        costFins: costesFin,
        costInis: costesIni,
        results : results,
        name: req.user.name,
        result: result
    })
});

module.exports = router;

