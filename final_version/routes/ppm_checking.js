const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const  { createObjectCsvWriter } =require('csv-writer');
// Create an Express app
// const app = express();
const moment = require('moment');
const path = require("path");
const { response } = require('express');

const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.join("views")));
router.use(express.static(path.join("data")));
router.use(express.static(path.join("public")));


router.get('/', (req, res) => {
    // Check if user is authenticated and has engineer privilege
    if (req.session.isAuthenticated && req.session.privilege === 'engineer') {
      var devices = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
      if (devices.length) {
        devices = devices.toString('utf-8').split(',');
      } else {
        devices = [];
      }
      for (let i = 0; i < devices.length; i++) {
        devices[i] += '.csv';
      }
  
      const beds = 'beds.csv';
      function parseCSV(csvFile) {
        const csvContent = fs.readFileSync(path.join(__dirname, '..', 'data', csvFile), 'utf8');
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
  
        const data = [];
  
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim() === '') {
            continue; // Skip empty lines
          }
  
          const values = line.split(',');
          const row = {};
  
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = values[j];
            row[header] = value;
          }
  
          data.push(row);
        }
  
        return data;
      }
  
      function show_PPM(assets, bed) {
        var serials = [];
  
        const data = parseCSV(bed);
        data.forEach((row) => {
          if (row.last_ppm_done_date === '') {
            var install_date = moment(row.installationDate, 'DD/MM/YYYY');
  
            var remainingDays = install_date.diff(moment(), 'days');
            console.log('remaining days is here', remainingDays);
            if (Math.abs(remainingDays) >= 30) {
              serials.push(row.serial);
            }
          }
          else if(row.last_ppm_done_date){
            var lastPPM = moment(row.last_ppm_done_date, 'DD/MM/YYYY');
  
            var remainingDays = lastPPM.diff(moment(), 'days');
            console.log('remaining days is here', remainingDays);
            if (Math.abs(remainingDays) >= 30) {
              serials.push(row.serial);
            }
          }
        });
     
  
        assets.forEach((csvFile) => {
          const devices = parseCSV(csvFile);
          devices.forEach((row) => {
            if (row.last_ppm_done_date === '') {
              var install_date = moment(row.installationDate, 'DD/MM/YYYY');
  
              var remainingDays = install_date.diff(moment(), 'days');
              console.log('remaining days is here', remainingDays);
              if (Math.abs(remainingDays) >= 30) {
                serials.push(row.serial);
              }
            }
            else if(row.last_ppm_done_date){
              var lastPPM = moment(row.last_ppm_done_date, 'DD/MM/YYYY');
    
              var remainingDays = lastPPM.diff(moment(), 'days');
              console.log('remaining days is here', remainingDays);
              if (Math.abs(remainingDays) >= 30) {
                serials.push(row.serial);
              }
            }
          });
        });
  
        return serials;
      }
  
      const getppm = show_PPM(devices, beds);
      console.log(getppm);
      
      var all_dev=devices;
      all_dev.push('beds.csv');
      let cardsHTML = ''; // Variable to store the HTML for cards
      // Generate HTML cards for each serial number
      getppm.forEach((serial) => {
        let department = '';
        let deviceName = '';
        let model = '';
        let deviceSerial = '';
        let location = '';
        let installation = '';
        let warranty = '';
        let service = '';
        let last = '';
        let status = '';
        let category = '';

        var match_found=0; 
        all_dev.forEach((csvFile) => {
          let device = parseCSV(csvFile);
          device.forEach((row) => {
            if(row.serial===serial){
              department=row.department;
              deviceName=row.deviceName;
              model = row.model;
              deviceSerial = row.serial;
              location = row.location;
              installation = row.installationDate;
              warranty = row.warrantyEndDate;
              service = row.service_period_in_years
              last = row.last_ppm_done_date
              status = row.status
              category = csvFile.substring(0, csvFile.lastIndexOf('.'));
              if(category == 'beds'){category = 'Bed';}
              match_found=1;
              // break;
            }
            

          });
        });
          
          
       
        if (match_found===1) {
          // Access additional information for the device
          // const location = device.location;
          cardsHTML += `
            <div class="card" style="width: 18rem;">
              <div class="card-body">
                  <center><h5 class="card-title">${deviceName}</h5></center>
                  <p class="card-text">Category: ${category}</p>
                  <p class="card-text"><a href="/viewAssets/${category}/${serial}">
                  Model: ${model}<br>
                  Serial: ${serial}</a></p>
                  <p class="card-text">Department: ${department}}</p>
                  <p class="card-text">Location: ${location}</p>
                  <p class="card-text">Warranty End Date: ${warranty}</p>
                  <p class="card-text">Contract Service End Date: ${service}</p>
                  <p class="card-text">Installation Date: ${installation}</p>
                  <p class="card-text">Last PPM: ${last}</p>
                  <p class="card-text">Status: ${status}</p>
                  <form method="post" action="/ppm">
                    <input type="hidden" name="serial" value="${serial}">
                    <center><button class = "btn-primary" type="submit">Update PPM Status</button></center>
                  </form>
              </div>
            </div>
          `;
        }
      });
  
      var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'ppm.html')).toString('utf-8');
      html = html.replace('{{ppm}}', cardsHTML);

      res.send(html);
    }
  });
  
  router.post("/", (req, res) => {
    const serial = req.body.serial;
    var devices = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'))
    if (devices.length) {
      devices = devices.toString('utf-8').split(',');
    } else {
      devices = [];
    }
    for (let i = 0; i < devices.length; i++) {
      devices[i] += '.csv';
    }
    devices.push('beds.csv');
    
    function parseCSV(csvFile) {
      const csvContent = fs.readFileSync(path.join(__dirname, '..', 'data', csvFile), 'utf8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
  
      const data = [];
  
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') {
          continue; // Skip empty lines
        }
  
        const values = line.split(',');
        const row = {};
  
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          const value = values[j];
          row[header] = value;
        }
  
        data.push(row);
      }
  
      return data;
    }
  
    devices.forEach((csvFile) => {
      if (csvFile === 'beds.csv') {
        const devices2 = parseCSV(csvFile);
        const rowIndex = devices2.findIndex((row) => row.serial === serial);
        if (rowIndex !== -1) {
          // Update the current date in the last_ppm_done_date column
          devices2[rowIndex].last_ppm_done_date = moment().format('DD/MM/YYYY');
  
          // Create a CSV writer for the specific CSV file
          const csvWriter = createObjectCsvWriter({
            path: path.join(__dirname, '..', 'data', csvFile),
            header: [
              { id: 'deviceName', title: 'deviceName' },
              { id: 'department', title: 'department' },
              { id: 'location', title: 'location' },
              { id: 'last_ppm_done_date', title: 'last_ppm_done_date' },
              { id: 'description', title: 'description' },
              { id: 'manufacturer', title: 'manufacturer' },
              { id: 'manufacturingDate', title: 'manufacturingDate' },
              { id: 'model', title: 'model' },
              { id: 'serial', title: 'serial' },
              { id: 'status', title: 'status' },
              { id: 'warrantyPeriod', title: 'warrantyPeriod' },
              { id: 'warrantyEndDate', title: 'warrantyEndDate' },
              { id: 'agent', title: 'agent' },
              { id: 'countryOfOrigin', title: 'countryOfOrigin' },
              { id: 'purchasingDate', title: 'purchasingDate' },
              { id: 'installationDate', title: 'installationDate' },
              { id: 'purchasingPrice', title: 'purchasingPrice' },
              { id: 'purchasingMethod', title: 'purchasingMethod' },
              { id: 'serviceContract', title: 'serviceContract' },
              { id: 'serviceContractCompany', title: 'serviceContractCompany' },
              { id: 'serviceContractValue', title: 'serviceContractValue' },
              { id: 'service_period_in_years', title: 'service_period_in_years' },
              { id: 'Patient_assigned_to_bed', title: 'Patient_assigned_to_bed' },
              { id: 'devices_attached_to', title: 'devices_attached_to' },
              { id: 'REP_maintainancehistory', title: 'REP_maintainancehistory' },
            ],
          });
  
          // Write the updated rows to the CSV file
          csvWriter.writeRecords(devices2).then(() => {
            console.log('Row updated successfully');
          });
        }
      } else {
        // Process other CSV files
        const devices2 = parseCSV(csvFile);
        const rowIndex = devices2.findIndex((row) => row.serial === serial);
        if (rowIndex !== -1) {
          // Update the current date in the last_ppm_done_date column
          devices2[rowIndex].last_ppm_done_date = moment().format('DD/MM/YYYY');
  
          // Create a CSV writer for the specific CSV file
          const csvWriter = createObjectCsvWriter({
            path: path.join(__dirname, '..', 'data', csvFile),
            header: Object.keys(devices2[0]).map((key) => ({ id: key, title: key })),
          });
  
          // Write the updated rows to the CSV file
          csvWriter.writeRecords(devices2).then(() => {
            console.log('Row updated successfully');
          });
        }
      }
    });
    res.redirect('/ppm')
  });


 module.exports=router;