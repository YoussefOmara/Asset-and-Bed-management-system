const path=require('path');
// import {checked} from "../public/submitted_alert_u" ;
const fun=require("../public/submitted_alert_u");
const express=require('express');
const bodyparse=require('body-parser');
const r=express.Router();
const db = require('../util/database_config.js');
r.use(express.static(path.join(__dirname,"../","public")));
r.use(bodyparse.urlencoded({extended:true }));
let data_submitted=false;
r.get("/register_user",(req,res,next)=>{
    res.sendFile(path.join(__dirname,"../","views","register_user.html"));
    // const name="seif khaled";
    // const pass="65";
    // db.query("SELECT Register_user_name,Register_users_pass FROM register_users where Register_user_name= ? and Register_users_pass=? ",
    // [name,pass],function(err,results){
    //     if (err){
    //         console.log("error");
    //         throw err;
    //     }
    //     else{
    //         console.log(results);

    //     }
    //  });
});

// db.check_connection();
// db.connection();
// db.query("DELETE  FROM register_users");
// db.query("DELETE  FROM register_users",function(err,conn){
//     if (err){
//         console.log("error");
//         throw err;
//     }
//     console.log("deleted");
//  });
r.post("/register_user",(req,res,next)=>{
    if ((req.body.Name.length!=0) && (req.body.Email.length!=0) &&(req.body.Password.length!=0) && (req.body.Confirm_Password.length!=0) &&
     (req.body.Department.length!=0) && (req.body.Hospital.length!=0)&& (req.body.Profession!="") ){
        const sql_s="insert into register_users (Register_users_pass,Register_user_name,Register_users_mail,Register_users_Hospital,Register_users_Department,Register_users_Profesion) values (?,?,?,?,?,?)";
        // const sql_s="insert into register_users values ?";

        // const sql_s="DELETE FROM register_users WHERE Register_users_pass = 'rrtr'";
        // const values_db=[[req.body.Password,req.body.Name,req.body.Email,req.body.Hospital,req.body.Department,req.body.Profession]];
        const values_db=[req.body.Password,req.body.Name,req.body.Email,req.body.Hospital,req.body.Department,req.body.Profession];
        // db.connect();
        db.execute(sql_s,values_db);
        // db.query(sql_s,[values_db],function(err,conn){
        //     if (err){
        //         console.log("error");
        //         throw err;
        //     }
        //     // console.log("inserted");
        // });
        data_submitted=true;    
        res.location("/login/redirect_screen").sendFile(path.join(__dirname,"../","views","submiited _alert_u.html"));
        // window.alert("User Info submitted");
        // res.send("USER INFO SUBMIITED SUCCESFULLY");
        // res.redirect
        // res.send(<button >back to main page</button>)
        // res.redirect("/login/redirect_screen");
        // db.end();

        

    
        // db.execute('insert into register_users (Register_users_pass,Register_user_name,Register_users_mail,Register_users_Hospital,Register_users_Department,Register_users_Profesion) values (?,?,?,?,?,?)',
        // [req.body.Password,req.body.Name,req.body.Email,req.body.Hospital,req.body.Department,req.body.Profession]);
        // console.log("submitted_succesfully");
        // res.redirect("/login/1");
        // console.log(req.body);
        // console.log(req.body.value);
        // return res.redirect("/login/register_user");
    }
});
// 



// r.post('/register_user',(req,res,next)=>{
    //     req.body.
    // });
    
    
    
    
module.exports={r,data_submitted};
// module.exports={execute_register,data_submitted};