const express=require('express')
//import express frm 'express'
const app = express()
const port=7000
app.get('/hello',(req,res)=>{
    res.send("Hello world!")
});
app.listen(port,()=>{
    console.log(`Example app listening at `)
});