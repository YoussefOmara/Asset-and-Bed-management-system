const express = require('express');
const fs = require('fs');
const path = require("path");
const router = express.Router();

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


router.get("/", (req,res)=>{
  if (req.session.isAuthenticated && (req.session.privilege === 'doctor' || req.session.privilege === 'nurse')) {
    var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'view_rep_D_N.html')).toString('utf-8');

    if(req.session.privilege == 'nurse'){html = html.replace("{{nav}}", nurseNav);}
    else {html = html.replace("{{nav}}", doctorNav);}

    var cards = '';

    const csvContent = fs.readFileSync(path.join(__dirname,"..","data",'Report.csv'), 'utf8').split('\n');
    const headers = csvContent[0].split(',');
    let id, user, description, category, serial, status;
    let max;

    for(let i = 0; i < headers.length; i++){
      if(headers[i] == 'id'){id = i; max = i;}
      else if(headers[i] == 'user'){user = i; max = i;}
      else if(headers[i] == 'description'){description = i; max = i;}
      else if(headers[i] == 'category'){category = i; max = i;}
      else if(headers[i] == 'serial'){serial = i; max = i;}
      else if(headers[i] == 'status'){status = i; max = i;}
    }

    for(let i = 1; i < csvContent.length; i++){
      let report = csvContent[i].split(',');
      if(max >= report.length || report[status] != 'open'){continue;}

      let catCsv;

      if(report[category] == 'Bed'){catCsv = fs.readFileSync(path.join(__dirname,"..","data",'beds.csv'), 'utf8').split('\n');}
      else if(fs.existsSync(path.join(__dirname,"..","data",`${report[category]}.csv`))){catCsv = fs.readFileSync(path.join(__dirname,"..","data",`${report[category]}.csv`), 'utf8').split('\n');}
      else{continue;}

      let catHead = catCsv[0].split(',');
      let name, model, warranty, contract, catStatus, department, location, catSerial;
      let catMax;
  
      for(let j = 0; j < catHead.length; j++){
        if(catHead[j] == 'deviceName'){name = j; catMax = j;}
        else if(catHead[j] == 'model'){model = j; catMax = j;}
        else if(catHead[j] == 'warrantyEndDate'){warranty = j; catMax = j;}
        else if(catHead[j] == 'service_period_in_years'){contract = j; catMax = j;}
        else if(catHead[j] == 'status'){catStatus = j; catMax = j;}
        else if(catHead[j] == 'department'){department = j; catMax = j;}
        else if(catHead[j] == 'location'){location = j; catMax = j;}
        else if(catHead[j] == 'serial'){catSerial = j; catMax = j;}
      }

      for(let j = 1; j < catCsv.length; j++){
        let asset = catCsv[j].split(',');
        if(catMax >= asset.length || asset[catSerial] != report[serial]){continue;}

        cards += `<div class="col-md-6 col-lg-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Report ID: ${report[id]}</h5>
              <p class="card-text">
                Submitted by: ${report[user]}<br>
                ${new Date(Number(report[id])).toLocaleString('en-GB')}<br>
                Category: ${report[category]}<br>
                <a href="/viewAssets/${report[category]}/${report[serial]}">Name: ${asset[name]}<br>
                Model: ${asset[model]}<br>
                Serial: ${report[serial]}</a><br>
                Department: ${asset[department]}<br>
                Location: ${asset[location]}<br>
                Warranty End Date: ${asset[warranty]}<br>
                Conract Service End Date: ${asset[contract]}<br>
                Device Status: ${asset[catStatus]}<br>
                Problem Description:<br>${report[description].replace(/\|/g, ',').replace(/{nl}/g, '<br>')}<br>
              </p>
            </div>
          </div>
        </div>`;

        break;
      }
    }

    html = html.replace('{{reports}}', cards);
    res.send(html);
  } 
});

module.exports = router;