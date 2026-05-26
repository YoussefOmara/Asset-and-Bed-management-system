const path=require('path');
// import { check } from '../public/login';
const fs=require("fs");
const express=require('express');
const bodyparse=require('body-parser');
const db = require('../util/database_config.js');
// const { json } = require('body-parser');
// const { writeFile } = require('fs/promises');
const r=express.Router();
// const public_login_js=require('../','public','login.js')

r.use(express.static(path.join(__dirname,"../","public")));
r.use(bodyparse.urlencoded({extended:true }));


r.post("/front_page_u",(req,res)=>{
    res.send("front_page");
    // res.sendFile(path.join(__dirname,"../","views","front_page_u.html"));
});

module.exports=r;
// r.post