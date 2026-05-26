const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
  // Check if user is authenticated and has engineer privilege
  if (req.session.isAuthenticated && req.session.privilege === 'engineer') {
    var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'remove_asset.html')).toString('utf-8');

    var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
    if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
    else{categoryList = [];}
    categoryList.push('Bed');

    var options = "";
    var values = "{";
    for(let i = 0; i < categoryList.length; i++){
      options += `<option value="${categoryList[i]}">${categoryList[i]}</option>\n`;

      var csvContent;
      if(categoryList[i] == 'Bed'){csvContent = fs.readFileSync(path.join(__dirname,"..","data",`beds.csv`), 'utf8').split('\n');}
      else{csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${categoryList[i]}.csv`), 'utf8').split('\n');}

      values += `'${categoryList[i]}': [`;

      const headers = csvContent[0].split(',');
      var serial;
      for(let i = 0; i < headers.length; i++){if(headers[i] == 'serial'){serial = i;}}

      for(let i = 1; i < csvContent.length; i++){
        let row = csvContent[i].split(',');
        if(serial >= row.length){continue;}

        values += `'${row[serial]}',`;
      }
      values += '],'
    }
    values += '}';

    html = html.replace("{{categories}}", options);
    html = html.replace("`{values}`", values);

    res.send(html);
  }
});

router.post('/', (req, res) => {
  if(req.session.isAuthenticated && req.session.privilege === 'engineer'){
    var{category, serial}=req.body;

    if(category == "Bed"){
      var csvContent = fs.readFileSync(path.join(__dirname,"..","data",`beds.csv`), 'utf8').split('\n');
  
      var headers = csvContent[0].split(',');
      var serialID, devices;
      var max;
      for(let i = 0; i < headers.length; i++){
        if(headers[i] == 'serial'){serialID = i; max = i;}
        else if(headers[i] == 'devices_attached_to'){devices = i; max = i;}
      }
  
      var newCsvContent = csvContent[0];
      var notFound = true;
      for(let i = 1; i < csvContent.length; i++){
        let row = csvContent[i].split(',');
        if(max < row.length && row[serialID] == serial){
          if(row[devices]){devices = row[devices];}
          notFound = false;
          continue;
        }
  
        newCsvContent += '\n' + csvContent[i];
      }
      csvContent += '\n';
      if(notFound){res.send(`${serial} from ${category} doesn't exist!`); return;}
  
      fs.writeFileSync(path.join(__dirname,"..","data",`beds.csv`), newCsvContent)
  
      if(devices){
        devices = new Set(devices.split('_').slice(1));
  
        var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
        if(!categoryList.length){res.send(`${serial} from ${category} removed successfully!`); return;}
        categoryList = categoryList.toString('utf-8').split(',');
  
        for(let i = 0; i < categoryList.length; i++){
          csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${categoryList[i]}.csv`), 'utf8').split('\n');
          newCsvContent = csvContent[0];
          var found = false;
          
          headers = csvContent[0].split(',');
          var patient;
          for(let i = 0; i < headers.length; i++){
            if(headers[i] == 'serial'){serialID = i; max = i;}
            else if(headers[i] == 'patient_assigned'){patient = i; max = i;}
          }
  
          for(let j = 1; j < csvContent.length; j++){
            let row = csvContent[j].split(',');    
            if(max < row.length && devices.has(row[serialID])){
              row[patient] = '';
              newCsvContent += '\n' + row.join(',');
              found = true;
              continue;
            }
      
            newCsvContent += '\n' + csvContent[j];
          }

          if(found){fs.writeFileSync(path.join(__dirname,"..","data",`${categoryList[i]}.csv`), newCsvContent)}
        }
      }
    }
    else{
      var csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${category}.csv`), 'utf8').split('\n');
  
      var headers = csvContent[0].split(',');
      var serialID;
      for(let i = 0; i < headers.length; i++){if(headers[i] == 'serial'){serialID = i;}}
  
      var newCsvContent = csvContent[0];
      var notFound = true;
      for(let i = 1; i < csvContent.length; i++){
        let row = csvContent[i].split(',');
        if(serialID < row.length && row[serialID] == serial){
          notFound = false;
          continue;
        }
  
        newCsvContent += '\n' + csvContent[i];
      }
      csvContent += '\n';
      if(notFound){res.send(`${serial} from ${category} doesn't exist!`); return;}
  
      fs.writeFileSync(path.join(__dirname,"..","data",`${category}.csv`), newCsvContent)

      csvContent = fs.readFileSync(path.join(__dirname,"..","data",`beds.csv`), 'utf8').split('\n');
      newCsvContent = csvContent[0];
  
      headers = csvContent[0].split(',');
      var devicesID;
      for(let i = 0; i < headers.length; i++){if(headers[i] == 'devices_attached_to'){devicesID = i;}}
      var found = false;
      
      for(let i = 1; i < csvContent.length; i++){
        let row = csvContent[i].split(',');
        
        if(devicesID < row.length){
          let devices = new Set(row[devicesID].split('_').slice(1));

          if(devices.has(serial)){
            devices.delete(serial);
            if(devices.size){row[devicesID] = '_' + Array.from(devices).join('_');}
            else{row[devicesID] = '';}
            newCsvContent += '\n' + row.join(',');
            found = true;
            continue;
          }
        }
  
        newCsvContent += '\n' + csvContent[i];
      }

      if(found){fs.writeFileSync(path.join(__dirname,"..","data",`beds.csv`), newCsvContent)}
    }

    res.send(`${serial} from ${category} removed successfully!`);
  }
});
  
module.exports = router;