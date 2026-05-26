const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.join("public")));

var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
else{categoryList = [];}

router.get('/', (req, res) => {
  // Check if user is authenticated and has engineer privilege
  if (req.session.isAuthenticated && req.session.privilege === 'engineer') {
    html = fs.readFileSync(path.join(__dirname, '..', 'views', 'Renew_Device_Service_Contract.html')).toString('utf-8');
    options = "";
    for(let i = 0; i < categoryList.length; i++){
      options += `<option value="${categoryList[i]}">${categoryList[i]}</option>\n`;
    }
    options += `<option value="Bed">Bed</option>\n`;
    res.send(html.replace("{{categories}}", options));
  }
});

router.post("/",(req,res)=>{
  const results=[];
  var { serialNo, deviceCategory, serviceContract, contractCompany, contractValue, servicePeriod } = req.body;

  filePath = "";
  if(categoryList.includes(deviceCategory)){filePath = path.join(__dirname, "..", "data", `${deviceCategory}.csv`);}
  else{filePath = path.join(__dirname, "..", "data", 'beds.csv');}

  servicePeriod = servicePeriod.split('-');
  servicePeriod = `${servicePeriod[2]}/${servicePeriod[1]}/${servicePeriod[0]}`;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let found = false;

      // Iterate through the CSV rows and update the matching serial number
      results.forEach((row) => {
        if (row['serial'] === serialNo) {
          row['serviceContract'] = serviceContract;
          row['serviceContractCompany'] = contractCompany;
          row['serviceContractValue'] = contractValue;
          row['service_period_in_years'] = servicePeriod;
          found = true;
        }
      });

      if (found) {
        // Write the updated data back to the CSV file
        const writableStream = fs.createWriteStream(filePath);

        // Write the headers
        const headers = Object.keys(results[0]).join(',');
        writableStream.write(`${headers}\n`);

        // Write the updated rows
        results.forEach((row) => {
          const rowValues = Object.values(row).join(',');
          writableStream.write(`${rowValues}\n`);
        });

        writableStream.end();

        res.status(200).send('Data updated successfully!');
      } else {
        res.status(404).send('Serial number not found!');
      }
    });
});



module.exports=router;