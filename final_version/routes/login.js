const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const argon2 = require("argon2")

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"..","views", 'login.html'));
});

router.post('/', (req, res) => {
  const { username, password } = req.body;
  async function authenticate(hash, pass, role) {
    try {
      if (await argon2.verify(hash, pass)) {
        req.session.isAuthenticated = true;
        req.session.privilege = role;
        req.session.user = username;

        res.redirect("/" + role);
      } else {
        res.redirect("/login?error=invalid_credentials");
      }
    } catch (err) {
      res.redirect("/login?error=" + err);
    }
  }


  const csvContent = fs.readFileSync(path.join(__dirname,"..","data",`users.csv`), 'utf8').split('\n');
  const headers = csvContent[0].split(',');
  var name, pass, role;
  var max;
  var notFound = true;
  

  for(let i = 0; i < headers.length; i++){
    if(headers[i] == 'username'){name = i; max = i;}
    else if(headers[i] == 'password'){pass = i; max = i;}
    else if(headers[i] == 'role'){role = i; max = i;}
  }

  for(let i = 1; i < csvContent.length; i++){
      let row = csvContent[i].split(',');

      if(max >= row.length){continue;}

      if(row[name] == username){
        if(!new Set(["admin", "engineer", "doctor", "nurse"]).has(row[role])){break;}
        notFound = false;
        authenticate(row[pass].replace(/\|/g, ','), password, row[role]);
        break;
      }
  }

  if(notFound){res.redirect('/login?error=invalid_credentials');}
});
module.exports = router;