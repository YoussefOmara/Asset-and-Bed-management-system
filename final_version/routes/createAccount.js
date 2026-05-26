const express = require('express');
const fs = require('fs');
const argon2 = require("argon2")
const path = require("path");
const router = express.Router()

router.get('/', (req, res) => {
  if (req.session.isAuthenticated && req.session.privilege === 'admin'){
    res.sendFile(path.join(__dirname ,"..","views","createAccount.html"));
  }
});

router.post('/', (req, res) => {
  if (req.session.isAuthenticated && req.session.privilege === 'admin'){
    var {username, password, role} = req.body;

    if(/[^\w\s]/.test(username)){res.redirect("/createAccount?err=invalid_username"); return;}
    if(!password){res.redirect("/createAccount?err=password_empty");}

    username = username.replace(/\s+/g,' ').trim();
    if(!(new Set(["admin", "engineer", "doctor", "nurse"]).has(role))){res.redirect("/createAccount?err=invalid_role"); return;}

    const csvContent = fs.readFileSync(path.join(__dirname,"..","data",`users.csv`), 'utf8').split('\n');
    const headers = csvContent[0].split(',');
    var name;

    for(let i = 0; i < headers.length; i++){if(headers[i] == 'username'){name = i;}}

    for(let i = 1; i < csvContent.length; i++){
        let row = csvContent[i].split(',');
        if(name >= row.length){continue;}

        if(row[name] == username){res.redirect("/createAccount?err=user_exists" ); return;}
    }

    async function hash(pass) {
      try {
        const hash = await argon2.hash(pass);
        
        const writableStream = fs.createWriteStream(path.join(__dirname,"..","data",`users.csv`), { flags: 'a' });
        writableStream.write(`${username},${hash.replace(/,/g, '|')},${role},active\n`);
        writableStream.end(() => {
            res.redirect('/createAccount');
          });
       } catch (err) {res.redirect("/createAccount?err=" + err);}
    }

    hash(password);
  }
});

module.exports=router