const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter=require('csv-writer').createObjectCsvWriter;
// Create an Express app
// const app = express();
const path = require("path");
const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.join("views")));
router.use(express.static(path.join("data")));
router.use(express.static(path.join("public")))



router.get("/", (req,res)=>{
  if (req.session.isAuthenticated && req.session.privilege === 'engineer') {
    var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'view_rep_eng.html')).toString('utf-8');

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
              <form action="/viewreporteng" method="post">
                <input type="hidden" name="id" value="${report[id]}">
                <input type="hidden" name="category" value="${report[category]}">
                <input type="hidden" name="serial" value="${report[serial]}">
                <label>Device Problem: </label>
                <select name="problem" id="problem" onchange='otherProblem(this.value, ${report[id]});'>
                  <option value="Need Spare Parts">Need Spare Parts</option>
                  <option value="Need Accessories">Need Accessories</option>
                  <option value="No Power">No Power</option>
                  <option value="other">Other</option>
                  <input type="text" placeholder="Problem Description" name="other" id="${report[id]}" style='display:none;'/>
                </select>
                <input type="text" name="action" placeholder="Action Taken"><br>
                <label>Device Status: </label>
                <select name="deviceStatus">
                  <option value="FF">FF</option>
                  <option value="PF">PF</option>
                  <option value="NF">NF</option>
                </select><br>
                <label>Report Status: </label>
                <select name="reportStatus">
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                </select><br>
                <center><button type="submit" style="margin: 5px auto;">Submit</button></center>
              </form>
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



router.post("/", (req, res) => {
  if (req.session.isAuthenticated && req.session.privilege === 'engineer') {
    var {id, category, serial, problem, other, action, deviceStatus, reportStatus} = req.body;

    var csvContent = fs.readFileSync(path.join(__dirname,"..","data",'Report.csv'), 'utf8').split('\n');
    var NEWcsvContent = csvContent[0] + '\n';

    let headers = csvContent[0].split(',');
    let repID, status;
    let found = false;
    let max;

    for(let i = 0; i < headers.length; i++){
      if(headers[i] == 'id'){repID = i; max = i;}
      else if(headers[i] == 'status'){status = i; max = i;}
    }

    for(let i = 1; i < csvContent.length; i++){
      let report = csvContent[i].split(',');
      if(max >= report.length){continue;}

      if(report[repID] == id){
        report[status] = reportStatus;
        NEWcsvContent += report.join(',') + '\n';
        found = true;
        continue;
      }

      NEWcsvContent += csvContent[i] + '\n';
    }

    if(found){fs.writeFileSync(path.join(__dirname,"..","data",`Report.csv`), NEWcsvContent);}

    if(category == 'Bed'){category = 'beds'; csvContent = fs.readFileSync(path.join(__dirname,"..","data",'beds.csv'), 'utf8').split('\n');}
    else if(fs.existsSync(path.join(__dirname,"..","data",`${category}.csv`))){csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${category}.csv`), 'utf8').split('\n');}
    else{res.redirect('/viewreporteng'); return;}

    NEWcsvContent = csvContent[0] + '\n';
    headers = csvContent[0].split(',');
    let catSerial, history, catStatus;
    found = false;

    for(let i = 0; i < headers.length; i++){
      if(headers[i] == 'serial'){catSerial = i; max = i;}
      else if(headers[i] == 'REP_maintainancehistory'){history = i; max = i;}
      else if(headers[i] == 'status'){catStatus = i; max = i;}
    }

    for(let i = 1; i < csvContent.length; i++){
      let asset = csvContent[i].split(',');
      if(max >= asset.length){continue;}

      if(asset[catSerial] == serial){
        asset[catStatus] = deviceStatus;

        if(problem == 'other'){problem = other.replace(/\s+/g,' ').trim()}
        action = action.replace(/\s+/g,' ').trim();

        if(problem || action){
          asset[history] += `<br>${new Date().toLocaleString('en-GB')}| ${req.session.user}| Problem description: ${problem}| Action taken: ${action}`.replace(/,/g, '|');
        }

        NEWcsvContent += asset.join(',') + '\n';
        found = true;
        continue;
      }

      NEWcsvContent += csvContent[i] + '\n';
    }

    if(found){fs.writeFileSync(path.join(__dirname,"..","data",`${category}.csv`), NEWcsvContent);}

    res.redirect('/viewreporteng')
  }
});

module.exports=router;