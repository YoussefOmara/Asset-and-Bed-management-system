const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const argon2 = require("argon2")

const adminNav = `<li class="nav-item">
<a class="nav-link active" aria-current="page" href="/admin">Home</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/createAccount">Add User</a>
</li>`

const engineerNav = `<li class="nav-item">
<a class="nav-link active" aria-current="page" href="/engineer">Home</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewreporteng">Action Center</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewAssets">View Assets</a>
</li>
<li class="nav-item dropdown">
<a class="nav-link dropdown-toggle" href="#" id="dropdown03" data-bs-toggle="dropdown" aria-expanded="false">Manage Assets</a>
<ul class="dropdown-menu" aria-labelledby="dropdown03">
<li><a class="dropdown-item" href="/add_asset">Add Asset</a></li>
<li><a class="dropdown-item" href="/Remove_asset">Remove Asset</a></li>
<li><a class="dropdown-item" href="/Renew_Device_Service_Contract">Renew Device Service Contract</a></li>
<li><a class="dropdown-item" href="/ppm">PPM</a></li>
</ul>
</li>`;

const nurseNav = `<li class="nav-item">
<a class="nav-link active" aria-current="page" href="/nurse">Home</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/Submit_report">Report Issue</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewreport">View Reports</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewAssets">View Assets</a>
</li>
<li class="nav-item dropdown">
<a class="nav-link dropdown-toggle" href="#" id="dropdown03" data-bs-toggle="dropdown" aria-expanded="false">Asset Assignment</a>
<ul class="dropdown-menu" aria-labelledby="dropdown03">
  <li><a class="dropdown-item" href="/assign_bed">Assign Bed</a></li>
  <li><a class="dropdown-item" href="/assign_device">Assign Device</a></li>
  <li><a class="dropdown-item" href="/remove_bed">Unassign Bed</a></li>
  <li><a class="dropdown-item" href="/remove_assigned_device">Unassign Device</a></li>
</ul>
</li>`;

const doctorNav = `<li class="nav-item">
<a class="nav-link active" aria-current="page" href="/doctor">Home</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/Submit_report">Report Issue</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewreport">View Reports</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewAssets">View Assets</a>
</li>`;



router.get('/', (req, res) => {
    if(req.session.isAuthenticated && (req.session.privilege === 'admin' || req.session.privilege === 'engineer' || req.session.privilege === 'doctor' || req.session.privilege === 'nurse'))
    var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'changePass.html')).toString('utf-8');

    if(req.session.privilege == 'admin'){html = html.replace("{{nav}}", adminNav);}
    else if(req.session.privilege == 'engineer'){html = html.replace("{{nav}}", engineerNav);}
    else if(req.session.privilege == 'nurse'){html = html.replace("{{nav}}", nurseNav);}
    else {html = html.replace("{{nav}}", doctorNav);}

    res.send(html);
});

router.post('/', (req, res) => {
  var { oldPass, newPass } = req.body;

  async function authenticate(hash, csvContent, USERcsvContent, i, pass, max) {
    try {
      if (await argon2.verify(hash, oldPass)) {
        let row = csvContent[i].split(',');
        row[pass] = await argon2.hash(newPass);
        row[pass] = row[pass].replace(/,/g, '|');

        USERcsvContent += row.join(',') + '\n';
        i++;

        for(; i < csvContent.length; i++){
            row = csvContent[i].split(',');
            if(max >= row.length){continue;}

            USERcsvContent += csvContent[i] + '\n'
        }
        
        fs.writeFileSync(path.join(__dirname,"..","data",`users.csv`), USERcsvContent);

        res.redirect('/' + req.session.privilege);

      } else {
        res.redirect('/changePass?wrong_pass');
      }
    } catch (err) {
        res.redirect('/changePass?err=' + err);
    }
  }

  const csvContent = fs.readFileSync(path.join(__dirname,"..","data",`users.csv`), 'utf8').split('\n');
  let USERcsvContent = csvContent[0] + '\n';

  const headers = csvContent[0].split(',');
  var name, pass, role, status;
  var max;
  var notFound = true;
  

  for(let i = 0; i < headers.length; i++){
    if(headers[i] == 'username'){name = i; max = i;}
    else if(headers[i] == 'password'){pass = i; max = i;}
    else if(headers[i] == 'role'){role = i; max = i;}
    else if(headers[i] == 'status'){status = i; max = i;}
  }

    for(let i = 1; i < csvContent.length; i++){
      let row = csvContent[i].split(',');
      if(max >= row.length){continue;}

        if(row[name] == req.session.user){
            if(!(new Set(["admin", "engineer", "doctor", "nurse"]).has(row[role])) || row[status] != 'active'){break;}
            notFound = false;

            authenticate(row[pass].replace(/\|/g, ','), csvContent, USERcsvContent, i, pass, max);
            break;
        }

        USERcsvContent += csvContent[i] + '\n';
    }

    if(notFound){res.redirect('/logout'); return;}
});
module.exports = router;