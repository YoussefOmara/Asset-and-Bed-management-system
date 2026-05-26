const express = require('express');
const router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const bodyparse=require('body-parser');
// const { route } = require('./login');
router.use(express.static(path.join("public")));
router.use(express.static(path.join(__dirname, "views")));
router.use(bodyparse.urlencoded({extended:true }));

// app.use(bodyparse.urlencoded({extended:true }));
router.get('/',(req,res)=> {
  if (req.session.isAuthenticated && req.session.privilege === 'nurse') {
    html = fs.readFileSync(path.join(__dirname, '..', 'views', 'Nurse.html')).toString('utf-8');

    var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
    if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
    else{categoryList = [];}

    var departmentList = new Set();
    var departmentDict = {}

    var picFiles = fs.readdirSync(path.join(__dirname, '..', 'public', 'pics'));
    var pics = {};
    for(let i = 0; i < picFiles.length; i++){
        pics[picFiles[i].substr(0, picFiles[i].lastIndexOf('.')) || picFiles[i]] = picFiles[i];
    }
    if(!('placeholder' in pics)){pics['placeholder'] = '';}

    var categories = `['Bed',`;
    var values = `{'Bed':[`;
    var departments =  '';
    var cardCats = `<div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title m-0">Bed</h3>
        <button class="btn panel-button" onclick="togglePanel('BedPanel')">Toggle Panel</button>
      </div>
      <div id="BedPanel" class="panel-body">
        <div id="Bed" class="card-container"></div>
      </div>
    </div><br>`;

    var devicesDict = {}
    var bedDevicesDict = {}

    {
      const csvContent = fs.readFileSync(path.join(__dirname,"..","data",'beds.csv'), 'utf8').split('\n');
      const headers = csvContent[0].split(',');
      let department, location, name, model, serial, status, patient, devices;
      let max;
  
      for(let i = 0; i < headers.length; i++){
        if(headers[i] == 'department'){department = i; max = i;}
        else if(headers[i] == 'location'){location = i; max = i;}
        else if(headers[i] == 'deviceName'){name = i; max = i;}
        else if(headers[i] == 'model'){model = i; max = i;}
        else if(headers[i] == 'serial'){serial = i; max = i;}
        else if(headers[i] == 'status'){status = i; max = i;}
        else if(headers[i] == 'Patient_assigned_to_bed'){patient = i; max = i;}
        else if(headers[i] == 'devices_attached_to'){devices = i; max = i;}
      }
  
      for(let i = 1; i < csvContent.length; i++){
        let row = csvContent[i].split(',');
        if(max >= row.length){continue;}
  
        if(row[status].toLowerCase() == 'ff'){
          if(row[patient] == ''){row[status] = 'Available';}
          else{row[status] = 'Occupied';}
        }
        else{row[status] = 'Not Functional';}

        if(row[devices]){
          let tmp = new Set(row[devices].split('_').slice(1));          
          bedDevicesDict[row[serial]] = [];

          tmp.forEach(dev => {devicesDict[dev] = '';
            bedDevicesDict[row[serial]].push(dev);
          });
        }

        values += `['${row[department]}', '${row[location]}', '${row[name]}', '${row[model]}', '${row[serial]}', '${row[status]}'],`;


        if(departmentList.has(row[department])){departmentDict[row[department]][row[status]] += 1;}
        else{
          departmentDict[row[department]] = {};
          departmentDict[row[department]]["Available"] = 0;
          departmentDict[row[department]]["Occupied"] = 0;
          departmentDict[row[department]]["Not Functional"] = 0;
          departmentDict[row[department]][row[status]] += 1;
        }
        departmentList.add(row[department]);

      }
      values += '],'
    }



    for(let i = 0; i < categoryList.length; i++){
      const csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${categoryList[i]}.csv`), 'utf8').split('\n');

      categories += `'${categoryList[i]}',`
      values += `'${categoryList[i]}':[`
      cardCats += `<div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title m-0">${categoryList[i]}</h3>
        <button class="btn panel-button" onclick="togglePanel('${categoryList[i]}Panel')">Toggle Panel</button>
      </div>
      <div id="${categoryList[i]}Panel" class="panel-body" style="display: none;">
        <div id="${categoryList[i]}" class="card-container"></div>
      </div>
    </div><br>`;
      
      const headers = csvContent[0].split(',');
      let department, location, name, model, serial, status, patient;
      let max;

      for(let j = 0; j < headers.length; j++){
        if(headers[j] == 'department'){department = j; max = j;}
        else if(headers[j] == 'location'){location = j; max = j;}
        else if(headers[j] == 'deviceName'){name = j; max = j;}
        else if(headers[j] == 'model'){model = j; max = j;}
        else if(headers[j] == 'serial'){serial = j; max = j;}
        else if(headers[j] == 'status'){status = j; max = j;}
        else if(headers[j] == 'patient_assigned'){patient = j; max = j;}
      }

      for(let j = 1; j < csvContent.length; j++){
        let row = csvContent[j].split(',');
        if(max >= row.length){continue;}
  
        if(row[status].toLowerCase() == 'ff'){
          if(row[patient] == ''){row[status] = 'Available';}
          else{row[status] = 'Occupied';}
        }
        else{row[status] = 'Not Functional';}
    
        values += `['${row[department]}', '${row[location]}', '${row[name]}', '${row[model]}', '${row[serial]}', '${row[status]}'],`;

        if(departmentList.has(row[department])){departmentDict[row[department]][row[status]] += 1;}
        else{
          departmentDict[row[department]] = {};
          departmentDict[row[department]]["Available"] = 0;
          departmentDict[row[department]]["Occupied"] = 0;
          departmentDict[row[department]]["Not Functional"] = 0;
          departmentDict[row[department]][row[status]] += 1;
        }
        departmentList.add(row[department]);

        if(row[serial] in devicesDict){
          if(categoryList[i] in pics){devicesDict[row[serial]] = pics[categoryList[i]];}
          else{devicesDict[row[serial]] = pics['placeholder'];}
        }
      }

      values += '],'
    }


    categories += ']';
    values += '}';

    departmentList.forEach(dep => {departments += `<option value="${dep}">${dep}</option>`;});

    html = html.replace("{{cards}}", cardCats).replace("`{values}`", values).replace("`{categories}`", categories).replace("{{departments}}", departments).replace("`{departmentData}`", JSON.stringify(departmentDict)).replace("`{devicesDict}`", JSON.stringify(devicesDict)).replace("`{bedDevicesDict}`", JSON.stringify(bedDevicesDict)).replace("`{pics}`", JSON.stringify(pics));

    res.send(html);
  }
});

module.exports = router;