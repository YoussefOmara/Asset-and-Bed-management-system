const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const  { createObjectCsvWriter } =require('csv-writer');
// Create an Express app
// const app = express();
const path = require("path");
const router = express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.join("public")));

////

router.get('/', (req, res) => {
  var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));

  if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
  else{categoryList = [];}

  let serialDict = {}

  const data = [];
  fs.createReadStream(path.join(__dirname, '..', 'data', 'beds.csv'))
    .pipe(csv())
    .on('data', (row) => {
      // Check condition: Patient_assigned_to_bed is not empty
      if (row.Patient_assigned_to_bed !== '') {
        // Extract the desired data from the row
        const {
          serial,
          model,
          department,
          warrantyEndDate,
          serviceContract,
          status,
          Patient_assigned_to_bed,
        } = row;

        data.push({
          serial,
          model,
          department,
          warrantyEndDate,
          serviceContract,
          status,
          Patient_assigned_to_bed,
        });
      }
    })
    .on('end', () => {
      // Render the HTML page with the extracted data
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Remove Bed</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat&family=Ubuntu&display=swap" rel="stylesheet">
            <style>
              /* Add CSS styles for card layout */
              body {
                background-color: #f5f5f5;
                font-family: Arial, sans-serif;
              }

              h1 {
                text-align: center;
                color: #dc3545;
                margin-top: 20px;
                font-size: 28px;
                font-weight: bold;
                font-family: 'Montserrat', sans-serif;
                font-family: 'Ubuntu', sans-serif;
                transition: transform 0.3s;
              }

              h1:hover {
                transform: translateY(-5px);
              }

              .cards {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                background-color: #f5f5f5;
                padding: 20px;
              }


              h1 span {
                color: inherit;
                transition: color 0.3s;
              }

              h1:hover span {
                color: #E88B15;
              }
              #bedsContainer {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                background-color: #f5f5f5;
                padding: 20px;
              }

              .card {
                width: 300px;
                margin: 10px;
                padding: 20px;
                border-radius: 5px;
                background-color: #fff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s;
                border: 2px solid #dc3545;
              }

              .card:hover {
                transform: translateY(-5px);
              }

              .card p {
                margin: 0;
              }

              .card p.serial {
                font-weight: bold;
              }
            </style>
           
        </head>
        <body>
            <h1>Assign Bed Devices</h1>
            <div id="bedsContainer">
            
            `;
            
            data.forEach((bedData) => {
              const { serial, model, department, warrantyEndDate, serviceContract, status, Patient_assigned_to_bed } = bedData;

              serialDict[serial] = [];
              console.log(ser)

              let ops = '';
              let found = false;
      
              for(let x = 0; x < categoryList.length; x++){
                var csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${categoryList[x]}.csv`), 'utf8').split('\n');
                
                let headers = csvContent[0].split(',');
                let serialID;
              
                for(let i = 0; i < headers.length; i++){
                  if(headers[i] == 'serial'){serialID = i;}
                }
              
                for(let i = 1; i < csvContent.length; i++){
                  let row = csvContent[i].split(',');
                  if(serialID >= row.length){continue;}
              
                  if(row[serialID] == serial){
                    found = true;
                    break;
                  }  
                }
      
                if(found){serialDict[serial].push(categoryList[x]); break;}
              }

              for(let i = 0; i < serialDict[serial].length; i++){ops += `<option value="${serialDict[serial][i]}">${serialDict[serial][i]}</option>`}

              html+= `
              <div class="card">
              <h4>Select Device:</h4>
              <h4>Serial: ${serial}</h4>
              <p>Model: ${model}</p>
              <p>Department: ${department}</p>
              <p>Warranty End Date: ${warrantyEndDate}</p>
              <p>Service Contract: ${serviceContract}</p>
              <p>Status: ${status}</p>
              <p>Assigned to Patient: ${Patient_assigned_to_bed}</p>
              <p class="patient-assigned-field" style="display: none;">${Patient_assigned_to_bed}</p>
              <form class="device-form" action="/remove_assigned_device" method='post'> <!-- Add the form tag -->
              <input type="hidden" name="patientID" value="${Patient_assigned_to_bed}">
              <select class="device-dropdown" name="deviceType">
                  <option value="">Select Device</option>
                  ${ops}
                </select>
                <h4>Select Serial:</h4>
                <select class="serial-dropdown" name="serialNumber">
                  <option value="">Select Serial</option>
                </select>
                <button type="submit">Submit</button> <!-- Add the submit button -->
              </form>
            </div>
            ` ;
            });
            html += `
            </div>
            <script>
            // Function to fetch serial numbers based on the selected device type
            function fetchSerialNumbers(event) {
              const deviceType = event.target.value;
              const patientID = event.target.closest('.card').querySelector('.patient-assigned-field').textContent.trim();
              const cardElement = event.target.closest('.card');
              const serialDropdown = cardElement.querySelector('.serial-dropdown');
            
              // Clear previous options
              serialDropdown.innerHTML = '';
            
              // Make AJAX request to fetch serial numbers
              fetch('/remove_serials/' +deviceType + '/' + patientID )
                .then(response => response.json())
                .then(data => {
                  // Populate the serial dropdown with the fetched serial numbers
                  data.serialNumbers.forEach(serial => {
                    const option = document.createElement('option');
                    option.value = serial;
                    option.textContent = serial;
                    serialDropdown.appendChild(option);
                  });
                })
                .catch(error => {
                  console.error(error);
                });
            }
            
            // Add event listeners to all device dropdowns
            const deviceDropdowns = document.querySelectorAll('.device-dropdown');
            deviceDropdowns.forEach(dropdown => {
              dropdown.addEventListener('change', fetchSerialNumbers);
            });

            // Add event listener to device dropdown
            document.addEventListener('DOMContentLoaded', function() {
              const deviceDropdown = document.getElementById('device-dropdown');
              if (deviceDropdown) {
                deviceDropdown.addEventListener('change', fetchSerialNumbers);
              }
            });
            function handleFormSubmit(event) {
              event.preventDefault(); // Prevent the default form submission behavior
            
              const cardElement = event.target.closest('.card');
              const deviceDropdown = cardElement.querySelector('.device-dropdown');
              const serialDropdown = cardElement.querySelector('.serial-dropdown');
              const patientAssignedField = cardElement.querySelector('.patient-assigned-field');

              const deviceType = deviceDropdown.value;
              const serialNumber = serialDropdown.value;
              const patientAssigned = patientAssignedField.textContent.trim();

              // Make AJAX request to update the CSV file
              fetch('/remove_assigned_device', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ deviceType, serialNumber, patientAssigned  })
              })
                .then(response => {
                  if (response.ok) {
                    // Perform desired actions upon successful response
                    console.log('CSV file updated successfully');
                  } else {
                    throw new Error('Failed to update the CSV file');
                  }
                })
                .catch(error => {
                  console.error(error);
                });
            }
          
            // Add event listeners to all device dropdowns
            const deviceForms = document.querySelectorAll('.device-form');
            deviceForms.forEach(form => {
              form.addEventListener('submit', handleFormSubmit);
            });
          
            // Add event listener to device dropdown
            document.addEventListener('DOMContentLoaded', () => {
              const deviceDropdowns = document.querySelectorAll('.device-dropdown');
              deviceDropdowns.forEach(dropdown => {
                dropdown.addEventListener('change', fetchSerialNumbers);
              });
            });
          </script>
        </body>
        </html>
        `;

      res.send(html);
    }); 
  
});
  





router.post('/', (req, res) => {
  const { deviceType, serialNumber, patientAssigned } = req.body;

  const csvData = [];
  const csvData2 = [];

  const bedCsvStream = fs.createReadStream(path.join(__dirname, '..', 'data', 'beds.csv'))
    .pipe(csv())
    .on('data', (row) => {
      csvData.push(row);
    })
    .on('end', () => {
      const rowToUpdate = csvData.find((row) => row.Patient_assigned_to_bed === patientAssigned);
      if (rowToUpdate) {
        rowToUpdate.devices_attached_to=rowToUpdate.devices_attached_to.replace(`_${serialNumber}`,'');
      } else {
        console.log('Patient not found in beds.csv');
      }

      updateDeviceCsv();
    });

  const updateDeviceCsv = () => {
    const deviceCsvStream = fs.createReadStream(path.join(__dirname, '..', 'data', `${deviceType}.csv`))
      .pipe(csv())
      .on('data', (row) => {
        csvData2.push(row);
      })
      .on('end', () => {
        const rowToUpdate = csvData2.find((row) => row.serial === serialNumber);
        if (rowToUpdate) {
          rowToUpdate.patient_assigned = '';
        } else {
          console.log('Patient not found in device CSV');
        }

        writeCsv();
      });
  };

  const writeCsv = () => {
    const csvWriter1 = createObjectCsvWriter({
      path: path.join(__dirname, '..', 'data', 'beds.csv'),
      header: [
        { id: 'deviceName', title: 'deviceName' },
            { id: 'department', title: 'department' },
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

    const csvWriter2 = createObjectCsvWriter({
      path: path.join(__dirname, '..', 'data', `${deviceType}.csv`),
      header: [
        { id: 'deviceName', title: 'deviceName' },
        { id: 'department', title: 'department' },
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
        { id: 'patient_assigned', title: 'patient_assigned' },
        { id: 'REP_maintainancehistory', title: 'REP_maintainancehistory' },
      
      ],
    });

    csvWriter1.writeRecords(csvData).then(() => {
      console.log('beds.csv updated successfully');
      csvWriter2.writeRecords(csvData2).then(() => {
        console.log(`${deviceType}.csv updated successfully`);
        res.redirect('/');
      });
    });
  };

});

module.exports=router;