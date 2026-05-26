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


// //...
router.get('/', (req, res) => {
  // Read the beds.csv file
  const rows = [];
  fs.createReadStream(path.join(__dirname, '..', 'data', 'beds.csv'))
    .pipe(csv())
    .on('data', (row) => {
      // Check condition: Patient_assigned_to_bed is not empty
      if (row.Patient_assigned_to_bed !== '') {
        rows.push(row);
      }
    })
    .on('end', () => {
      // Extract the desired data from the rows
      const bedsData = rows.map((row) => {
        const { serial, model, department, warrantyEndDate, serviceContract, status, Patient_assigned_to_bed, devices_attached_to } = row;
        const devicesAttachedTo = devices_attached_to.split('_').filter((item) => item !== '');
        return {
          serial,
          model,
          department,
          warrantyEndDate,
          serviceContract,
          status,
          Patient_assigned_to_bed,
          devicesAttachedTo,
          uniqueCategories: [], // Initialize uniqueCategories array
        };
      });

      // Function to check if a serial number exists in a CSV file
      const checkSerialInCSV = (csvFilePath, serial) => {
        return new Promise((resolve, reject) => {
          fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
              if (row.serial === serial) {
                resolve(true);
              }
            })
            .on('end', () => {
              resolve(false);
            })
            .on('error', (error) => {
              reject(error);
            });
        });
      };

      // Function to search for serial numbers in the provided CSV files
      let csvFiles = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
      if (csvFiles.length) {
        csvFiles = csvFiles.toString('utf-8').split(',');
      } else {
        csvFiles = [];
      }
      for (let i = 0; i < csvFiles.length; i++) {
        csvFiles[i] += '.csv';
        console.log("key=", csvFiles[i], "value=", `/Devices_icons/${csvFiles[i].replace('.csv', '')}.png`);
      }

      const searchSerialNumbers = async (serialNumbers) => {
        const catg = []; // List to store the categories

        for (const csvFile of csvFiles) {
          const csvFilePath = path.join(__dirname, '..', 'data', csvFile);
          const foundCategories = [];
          for (const serialNumber of serialNumbers) {
            const serialExists = await checkSerialInCSV(csvFilePath, serialNumber);
            if (serialExists) {
              console.log(serialNumber, "is in", csvFile);
              foundCategories.push(csvFile);
              break;
            }
          }
          catg.push(foundCategories); // Push the found categories for each CSV file
        }
        return catg;
      };
      
      
      
      
      
      
      


      // Render the HTML page with the extracted data
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous"/>
          <title>Unassign Bed</title>
          <link rel="stylesheet" href="/general.css" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat&family=Ubuntu&display=swap" rel="stylesheet">
          <style>
            /* Add CSS styles for card layout */
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
              position: relative;
            }
            
            .card:hover {
              transform: translateY(-5px);
            }
            
            .card .category-image {
              display: flex;
              width: 5%;
              display: inline;
              height: auto;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
            }
            
            .card-image {
              display: flex;
              justify-content: center;
              text-align: center;
            }
            
            .card-image img {
              max-width: 20%;
              height: auto;
            }
            
            .card p:last-child {
              margin-bottom: 0;
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
        <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#"><img src="/Health_Flow.png"/ width="100" height="100"></a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample03" aria-controls="navbarsExample03" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
    
          <div class="collapse navbar-collapse" id="navbarsExample03">
            <ul class="navbar-nav me-auto mb-2 mb-sm-0">
              <li class="nav-item">
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
              </li>
            </ul>
          </div>
        </div>
        <button class="logout" style="width: 140px;" onclick="location.href='/changePass';">Change Pass</button>
        <button class="logout" onclick="location.href='/logout';">Log out</button>
      </nav>
          <h1>Unassign Bed</h1>
          <div id="bedsContainer">
      `;

      // Search for serial numbers in the provided CSV files
      Promise.all(bedsData.map((bed) => searchSerialNumbers(bed.devicesAttachedTo)))
        .then((categories) => {
          const categoryImages = {};
          for (let i = 0; i < csvFiles.length; i++) {
            const key = csvFiles[i];
            const value = `/Devices_icons/${csvFiles[i].replace('.csv', '')}.png`;
            console.log("key=",key,"value=",value);
            categoryImages[key] = value;
          }
          // Populate the uniqueCategories property in bedsData
          
  
          // Generate the cards using the extracted data
          bedsData.forEach(async (bed, index) => {
        const bedCategories = categories[index];
        console.log("catg index", categories[index]);
        let categoryImagesHTML = '';
        if (bedCategories.length > 0) {
          categoryImagesHTML = bedCategories
            .map((category) => {
              const imageURL = categoryImages[category];
              console.log('category:', category, 'imageURL:', imageURL);
              return imageURL;
            })
            .filter((imageURL) => imageURL) // Remove any undefined URLs
            .map((imageURL) => `<img src="${imageURL}" alt="Category Image">`)
            .join('');
        } else {
          categoryImagesHTML = '<p>No categories found.</p>';
        }
        console.log('categoryImagesHTML:', categoryImagesHTML);
          

            html += `
              <div class="card">
                <h4>Serial: ${bed.serial}</h4>
                <p>Model: ${bed.model}</p>
                <p>Department: ${bed.department}</p>
                <p>Warranty End Date: ${bed.warrantyEndDate}</p>
                <p>Service Contract: ${bed.serviceContract}</p>
                <p>Status: ${bed.status}</p>
                <p>Assigned to Patient: ${bed.Patient_assigned_to_bed}</p>
                <p>Devices Attached To: ${bed.devicesAttachedTo.join(', ')}</p>
                <p>Categories: ${bed.uniqueCategories.join(', ')}</p>
                <div class="card-image">
                  ${categoryImagesHTML}
                </div>
                <form method="POST" action="/remove_bed">
                  <input type="hidden" name="serial" value="${bed.serial}">
                  ${bed.devicesAttachedTo.map((deviceSerial) => `<input type="hidden" name="devicesAttached[]" value="${deviceSerial}">`).join('')}
                  <input type="hidden" name="patientId" value="${bed.Patient_assigned_to_bed}">
                  <button type="submit">Remove Assignment</button>
                </form>
              </div>
            `;
          });
          // Complete the HTML page and send the response
          html += `
            </div>
            <script src="/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
          </body>
          </html>
          `;
          res.send(html);
        })
        .catch((error) => {
          console.error('Error:', error);
          res.send('An error occurred.');
        });
    });
});


      
    

router.post('/', (req, res) => {
  const { serial, patientId, devicesAttached } = req.body;
  console.log('Received serial:', serial);
  console.log('Received patientId:', patientId);
  console.log('Received devices:', devicesAttached);
  const rows = [];

  // Read the beds.csv file and update the data
  fs.createReadStream(path.join(__dirname, '..', 'data', 'beds.csv'))
    .pipe(csv())
    .on('data', (row) => {
      // Check condition: Serial matches and Patient_assigned_to_bed matches the given patientId
      if (row.serial === serial && row.Patient_assigned_to_bed === patientId) {
        console.log('Match found:', row);
        // Update the Patient_assigned_to_bed column to empty
        row.devices_attached_to = '';
        row.Patient_assigned_to_bed = '';
      }
      rows.push(row);
    })
    .on('end', () => {
      // Write the updated data back to the beds.csv file
      const csvWriter = createObjectCsvWriter({
        path: path.join(__dirname, '..', 'data', 'beds.csv'),
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

      csvWriter
        .writeRecords(rows)
        .then(() => {
          let devices =fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
          if (devices.length) {
            devices = devices.toString('utf-8').split(',');
          } else {
            devices = [];
          }
          for (let i = 0; i < devices.length; i++) {
            devices[i] += '.csv';
            // console.log("key=", csvFiles[i], "value=", `/Devices_icons/${csvFiles[i].replace('.csv', '')}.png`);
          }
          // Process each device CSV file
          devices.forEach((devicePath) => {
            const deviceRows = []; // Initialize deviceRows array for each device file

            // Read the device CSV file and update the data
            fs.createReadStream(path.join(__dirname, '..', 'data', devicePath))
              .pipe(csv())
              .on('data', (deviceRow) => {
                if (deviceRow.patient_assigned === patientId) {
                  console.log(`Match found in ${devicePath}:`, deviceRow);
                  // Update the Patient_assigned column to empty
                  deviceRow.patient_assigned = '';
                }
                deviceRows.push(deviceRow);
              })
              .on('end', () => {
                // Write the updated data back to the device CSV file
                const deviceCsvWriter = createObjectCsvWriter({
                  path: path.join(__dirname, '..', 'data', devicePath),
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
                    { id: 'patient_assigned', title: 'patient_assigned' },
                    { id: 'REP_maintainancehistory', title: 'REP_maintainancehistory' },
                  ],
                });

                deviceCsvWriter
                  .writeRecords(deviceRows)
                  .then(() => {
                    console.log(`Updated ${devicePath} successfully.`);
                  })
                  .catch((error) => {
                    console.error(`Error updating ${devicePath}:`, error);
                  });
              });
          });

          // Handle each device serial number after processing the beds.csv file
          devicesAttached.forEach((deviceSerial) => {
            // Handle each device serial number individually
            console.log('Device serial:', deviceSerial);
            // Rest of the logic specific to each device serial number
          });

          res.redirect('/remove_bed');
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('An error occurred. Please try again.');
        });
    });
});


module.exports = router;