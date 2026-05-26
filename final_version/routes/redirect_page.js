const path=require('path');
// import {checked} from "../public/submitted_alert_u" ;
const fun=require("../public/submitted_alert_u");
const express=require('express');
const bodyparse=require('body-parser');
const r=express.Router();
r.use(express.static(path.join(__dirname,"../","public")));
r.use(bodyparse.urlencoded({extended:true }));




// r.use("/login",get_url);
r.post("/login/redirect_screen",(req,res,next)=>{

    res.sendFile(path.join(__dirname,"../","views","submiited _alert_u.html"));
});
// if (fun.checked===true){
//     r.post("/redirect_screen",(req,res,next)=>{
//         res.redirect("/login/1");
//     });
// }


// function get_url(){
    
// }



module.exports=r;


