const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  // Check if user is authenticated and has engineer privilege
  if (req.session.isAuthenticated && req.session.privilege === 'engineer') {
    var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
    var departmentList = fs.readFileSync(path.join(__dirname, '../', 'data', 'department.dat'));

    if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
    else{categoryList = [];}
    categoryList.push('Bed');

    if(departmentList.length){departmentList = departmentList.toString('utf-8').split(',');}
    else{departmentList = [];}

    var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'add_asset.html')).toString('utf-8');
    var options = "";
    for(let i = 0; i < categoryList.length; i++){
      options += `<option value="${categoryList[i]}">${categoryList[i]}</option>\n`;
    }
    html = html.replace("{{categories}}", options);

    options = "";
    for(let i = 0; i < departmentList.length; i++){
      options += `<option value="${departmentList[i]}">${departmentList[i]}</option>\n`;
    }
    res.send(html.replace("{{departments}}", options));
  }
});

router.post('/', (req, res) => {
 
    var{category,other,deviceName,department,otherDep,location,description,manufacturer,manufacturingDate,model,serial,warrantyEndDate,agent,countryOfOrigin,purchasingDate,installationDate,purchasingPrice,purchasingMethod,serviceContract,serviceContractCompany,serviceContractValue,serviceContractEndDate}=req.body;

    if(serial.includes('_')){res.send("Serials can't include underscores!"); return;}

    manufacturingDate = manufacturingDate.split('-');
    manufacturingDate = `${manufacturingDate[2]}/${manufacturingDate[1]}/${manufacturingDate[0]}`;

    warrantyEndDate = warrantyEndDate.split('-');
    warrantyEndDate = `${warrantyEndDate[2]}/${warrantyEndDate[1]}/${warrantyEndDate[0]}`;

    purchasingDate = purchasingDate.split('-');
    purchasingDate = `${purchasingDate[2]}/${purchasingDate[1]}/${purchasingDate[0]}`;

    installationDate = installationDate.split('-');
    installationDate = `${installationDate[2]}/${installationDate[1]}/${installationDate[0]}`;

    if(serviceContractEndDate){
      serviceContractEndDate = serviceContractEndDate.split('-');
      serviceContractEndDate = `${serviceContractEndDate[2]}/${serviceContractEndDate[1]}/${serviceContractEndDate[0]}`;
    }

    csvFilePath = path.join(__dirname, '../', 'data', `${category}.csv`)

    if(department == "other"){
      otherDep = otherDep.replace(/\s+/g,' ').trim()
      if(otherDep == ''){res.send('INVALID department!'); return;}
      
      department = otherDep
      var departmentBuffer = fs.readFileSync(path.join(__dirname, '../', 'data', 'department.dat'));
      if(!departmentBuffer.toString('utf-8').split(',').includes(department)){
        if(departmentBuffer.length){fs.appendFileSync(path.join(__dirname, '../', 'data', 'department.dat'), `,${department}`);}
        else{fs.appendFileSync(path.join(__dirname, '../', 'data', 'department.dat'), `${department}`);}
      }
    }

    var formData = [deviceName,department,location,'',description,manufacturer,manufacturingDate,model,serial,'FF','',warrantyEndDate,agent,countryOfOrigin,purchasingDate,installationDate,purchasingPrice,purchasingMethod,serviceContract,serviceContractCompany,serviceContractValue,serviceContractEndDate,'',''];

    if(category == "other"){
      other = other.replace(/\s+/g,' ').trim();
      if(other == ''){res.send('INVALID category!'); return;}

      csvFilePath = path.join(__dirname, '../', 'data', `${other}.csv`)
      if(other == '' || fs.existsSync(csvFilePath)){res.send('INVALID category!'); return;}
      if(fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat')).length){fs.appendFileSync(path.join(__dirname, '../', 'data', 'asset.dat'), `,${other}`);}
      else{fs.appendFileSync(path.join(__dirname, '../', 'data', 'asset.dat'), `${other}`);}
      
      fs.writeFileSync(csvFilePath, "deviceName,department,location,last_ppm_done_date,description,manufacturer,manufacturingDate,model,serial,status,warrantyPeriod,warrantyEndDate,agent,countryOfOrigin,purchasingDate,installationDate,purchasingPrice,purchasingMethod,serviceContract,serviceContractCompany,serviceContractValue,service_period_in_years,patient_assigned,REP_maintainancehistory\n")
    }
    else if(category == "Bed"){
      csvFilePath = path.join(__dirname, '../', 'data', `beds.csv`);
      formData.push('');
    }

    formData = formData.join(',') + '\n';
    const writableStream = fs.createWriteStream(csvFilePath, { flags: 'a' });
        writableStream.write(formData);
        writableStream.end(() => {
            res.send('Submitted successfully');
          }); 
  });
  
  module.exports = router;