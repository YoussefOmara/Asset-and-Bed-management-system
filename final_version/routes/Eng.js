const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const  { createObjectCsvWriter } =require('csv-writer');
const session = require('express-session');
// Create an Express app
// const app = express();
const moment = require('moment');
const path = require("path");
const { response } = require('express');
const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.join("public")));

router.get('/',(req,res)=>{
    if (req.session.isAuthenticated && req.session.privilege === 'engineer') {
        function parseCSV(csvFile) {
            const csvContent = fs.readFileSync(path.join(__dirname,"..","data",csvFile), 'utf8');
            const lines = csvContent.split("\n");
            const headers = lines[0].split(",");
            
            const data = [];
            
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              if (line.trim() === "") {
                continue; // Skip empty lines
              }
              
              const values = line.split(",");
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
          
          const Report = "Report.csv";
          var devices = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'))
          if(devices.length){devices = devices.toString('utf-8').split(',');}
          else{devices = [];}
          for(let i = 0; i < devices.length; i++){devices[i] += '.csv';}
          devices.push('beds.csv');
          const beds="beds.csv";

          function parseDepartmentData(csvFiles) {
            const departmentData = [];
            
            csvFiles.forEach(csvFile => {
              const data = parseCSV(csvFile);
              
              data.forEach(row => {
                const department = row.department;
                const existingDepartment = departmentData.find(d => d.department === department);
                
                if (existingDepartment) {
                  existingDepartment.count++;
                } else {
                  departmentData.push({ department, count: 1 });
                }
              });
            });
            
            return departmentData;
          }
          
          function parseStatusData(csvFiles) {
            const statusData = [];
            
            csvFiles.forEach(csvFile => {
              const data = parseCSV(csvFile);
              
              data.forEach(row => {
                const status = row.status;
                const existingStatus = statusData.find(s => s.status === status);
                
                if (existingStatus) {
                  existingStatus.count++;
                } else {
                  statusData.push({ status, count: 1 });
                }
              });
            });
            
            return statusData;
          }
          function calculateWarranties(csvFiles) {
            let expiredWarrantiesCount = 0;
            let devicesCount = 0;
          
            csvFiles.forEach(csvFile => {
              const data = parseCSV(csvFile);
              const currentDate = new Date();
              const currentYear = currentDate.getFullYear();
              const currentMonth = currentDate.getMonth() + 1;
              const currentDay = currentDate.getDate();
          
              data.forEach(row => {
                const warrantyEndDate = row.warrantyEndDate.split("/");
                const warrantyDay = parseInt(warrantyEndDate[0], 10);
                const warrantyMonth = parseInt(warrantyEndDate[1], 10);
                const warrantyYear = parseInt(warrantyEndDate[2], 10);

                devicesCount++;

                if(currentYear > warrantyYear){expiredWarrantiesCount++;}
                else if(currentYear == warrantyYear){
                  if(currentMonth > warrantyMonth){expiredWarrantiesCount++;}
                  else if(currentMonth == warrantyMonth){
                    if(currentDay >= warrantyDay){expiredWarrantiesCount++;}
                  }
                }

                console.log(warrantyDay, '/', warrantyMonth, '/', warrantyYear, " +", expiredWarrantiesCount);

              });
            });
          
            return [devicesCount - expiredWarrantiesCount, expiredWarrantiesCount];
          }
       ///function
          function OccupiedVsNONoc(bedscsvfile){
            const bedsstatus = { occupied: 0, nonoccupied: 0 };
            const data = parseCSV(bedscsvfile);
            data.forEach(row => {
              // console.log();
              if(row.Patient_assigned_to_bed!=""){
                bedsstatus.occupied++;
              }
              else{
                bedsstatus.nonoccupied++;
              }

            });
            return bedsstatus;
            
          }


          function report_status_with_serials(reportcsv){
            const reportStatus = [];
            const data = parseCSV(reportcsv);
            data.forEach(row => {
              // console.log();
              if(row.status==="open"){
                reportStatus.push(row["serial"]);
              }
              

            });
            return reportStatus;
            
          }
        
          function parseReportStatusData(reportCSVFile) {
            const reportStatusData = [];
            
            const data = parseCSV(reportCSVFile);
            
            data.forEach(row => {
              const status = row.status;
              const existingStatus = reportStatusData.find(s => s.status === status);
              
              if (existingStatus) {
                existingStatus.count++;
              } else {
                reportStatusData.push({ status, count: 1 });
              }
            });
            
            return reportStatusData;
          }
          
          function occupiedequipment_vs_nonocc(files){
            const status = { occupied: 0, nonoccupied: 0 };

            // const data = parseCSV(files);
            files.forEach(csvFile => {
             

              const data = parseCSV(csvFile);
              if(csvFile==="beds.csv"){
                let occupied=0;
                let non_occupied=0;
                data.forEach(row => {
                  if(row.Patient_assigned_to_bed !== ""){
                    status.occupied++;
                    occupied++;
                    // console.log("status for occ",status.occupied);
                  }
                  else{
                    status.nonoccupied++;
                    non_occupied++;
                    // console.log("status for non occ",status.nonoccupied);
                  }
                });
                console.log("occ",occupied);
                console.log("non occ",non_occupied);
                 
              }
              else{
                let occupied=0;
                let non_occupied=0;
                data.forEach(row => {
                  console.log(csvFile);
                  if (row.patient_assigned !== "") {
                    status.occupied++;
                    occupied++;
                    // console.log("status for occupied",occupied);
                  } else {
                    status.nonoccupied++;
                    non_occupied++;
                    // console.log("status for non occ",non_occupied);
                  }
                  
                });
                console.log("occ",occupied);
                console.log("non occ",non_occupied);
              }
             
            });
            return status;
          }

          function show_PPM(assets,bed){
            var serials=[];

            const data = parseCSV(bed);
            data.forEach(row => {
              if(row.last_ppm_done_date===""){

                var install_date=moment(row.installationDate, 'DD/MM/YYYY');
                
                var remainingDays=install_date.diff(moment(),'days');
                console.log("remaining days is here",remainingDays)
                if(Math.abs(remainingDays)>=30){
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
          function parseDevicesData(csvFiles) {
            var devicesData = [];
            var devicesDataWarranty = [];
            const maxDays = 90;
      
            csvFiles.forEach(csvFile => {
              const data = parseCSV(csvFile);
      
              data.forEach(row => {
                const ContractEndDate = moment(row.service_period_in_years, 'DD/MM/YYYY');
                const remainingDays = ContractEndDate.diff(moment(), 'days');
                const remainingDaysWarranty = moment(row.warrantyEndDate, 'DD/MM/YYYY').diff(moment(), 'days');
      
                if (remainingDays <= maxDays  && remainingDays > -1) {
                  devicesData.push({
                    deviceName: row.deviceName,
                    remainingDays: remainingDays
                  });
                }

                if(remainingDaysWarranty <= maxDays  && remainingDaysWarranty > -1){
                  devicesDataWarranty.push({
                    deviceName: row.deviceName,
                    remainingDays: remainingDaysWarranty
                  });
                }
              });
            });
            
            for(let i = 0; i < devicesData.length - 1; i++){
              var min = maxDays+1;
              var minID = -1

              for(let j = i; j < devicesData.length; j++){
                if(devicesData[j]['remainingDays'] < min){min = devicesData[j]['remainingDays']; minID = j;}
              }

              var tmp = devicesData[i];
              devicesData[i] = devicesData[minID];
              devicesData[minID] = tmp;
            }

            for(let i = 0; i < devicesDataWarranty.length - 1; i++){
              var min = maxDays+1;
              var minID = -1

              for(let j = i; j < devicesDataWarranty.length; j++){
                if(devicesDataWarranty[j]['remainingDays'] < min){min = devicesDataWarranty[j]['remainingDays']; minID = j;}
              }

              var tmp = devicesDataWarranty[i];
              devicesDataWarranty[i] = devicesDataWarranty[minID];
              devicesDataWarranty[minID] = tmp;
            }
      
            return [devicesData, devicesDataWarranty];
          }

          const devicesCountdown = parseDevicesData(devices)
          const devicesContract = devicesCountdown[0];
          const devicesWarranty = devicesCountdown[1];
          const fileP = path.join(__dirname, "..", "views", "Engineer.html");
          
          const getppm= show_PPM(devices,beds)
          console.log("ppm serial is here",getppm);

          const report_stat_serial=report_status_with_serials(Report)
          console.log(report_stat_serial);
          const departmentData = parseDepartmentData(devices);
          console.log(departmentData);
          const warrantiesCount = calculateWarranties(devices);
          //function
          const statusData = parseStatusData(devices);
          const equipment_occupany=occupiedequipment_vs_nonocc(devices);
          console.log("equip occ:",equipment_occupany);
          // console.log(statusData);
          const occvsnon=OccupiedVsNONoc(beds);
          console.log(occvsnon)
          const reportStatusData = parseReportStatusData(Report);
          console.log(reportStatusData);
          const data = {
            departmentData: departmentData,
            statusData: statusData,
            equipment_occupany:equipment_occupany,
            occvsnon:occvsnon,
            report_stat_serial:report_stat_serial,
            reportStatusData: reportStatusData,
            getppm: getppm,
          };
          const filePath = path.join(__dirname, "..", "views", "Engineer.html");
          fs.readFile(filePath, 'utf8', (err, html) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Error reading HTML file');
            }
            let deviceListHtml = '';
            devicesContract.forEach(device => {
              deviceListHtml += `<li>${device.deviceName} : ${device.remainingDays} days remaining</li>`;
            });
            html = html.replace('<ul id="device-list-2"></ul>', `<ul id="device-list-2">${deviceListHtml}</ul>`);

            deviceListHtml = '';
            devicesWarranty.forEach(device => {
              deviceListHtml += `<li>${device.deviceName} : ${device.remainingDays} days remaining</li>`;
            });
            html = html.replace('<ul id="device-list"></ul>', `<ul id="device-list">${deviceListHtml}</ul>`);

//             console.log(data.bedsstatus.occupied);      // Output: Number of occupied beds
// console.log(data.bedsstatus.nonoccupied);   
      
            // Replace placeholders in the HTML file with the data
            html = html.replace('{{departmentData}}', JSON.stringify(departmentData));
            html = html.replace('{{statusData}}', JSON.stringify(statusData));
            html = html.replace('{{report_stat_serial}}', JSON.stringify(report_stat_serial));
            html = html.replace('{{reportStatusData}}', JSON.stringify(reportStatusData));
            html = html.replace('{{unexpiredWarrantiesCount}}', warrantiesCount[0]);
            html = html.replace('{{expiredWarrantiesCount}}', warrantiesCount[1]);
            html = html.replace('{{occvsnon}}', JSON.stringify(occvsnon));
            html=html.replace('{{equipment_occupany}}', JSON.stringify(equipment_occupany));
            html=html.replace('{{getppm}}', JSON.stringify(getppm));
            // html=html.replace('{{equipment_occupany}}', JSON.stringify(equipment_occupany));
            // html = html.replace('{{nonoccupiedBeds}}', JSON.stringify(data.bedsstatus[1]));
      
            // Send the modified HTML file as the response
            res.send(html);
          });
    }
    else{
        res.redirect('/login');
    }
});
module.exports=router;