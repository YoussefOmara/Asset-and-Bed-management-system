const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static('public'));

router.get('/', (req, res) => {
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
          devices_attached_to,
        } = row;

        const devicesAttachedTo = devices_attached_to.split('_').filter((item) => item !== '');
        data.push({
          serial,
          model,
          department,
          warrantyEndDate,
          serviceContract,
          status,
          Patient_assigned_to_bed,
          devicesAttachedTo,
        });
      }
    })
    .on('end', () => {
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
      var csvFiles=[];
      const searchSerialNumbers = async (serialNumbers) => {
        const catg = []; // List to store the categories
        csvFiles =  fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'))
        if(csvFiles.length){csvFiles = csvFiles.toString('utf-8').split(',');}
        else{csvFiles = [];}
        for(let i = 0; i < csvFiles.length; i++){csvFiles[i] += '.csv';}
        for (const csvFile of csvFiles) {
          const csvFilePath = path.join(__dirname, '..', 'data', csvFile);
          for (const serialNumber of serialNumbers) {
            const serialExists = await checkSerialInCSV(csvFilePath, serialNumber);
            if (serialExists) {
              console.log(serialNumber, "is in", csvFile);
              catg.push(csvFile);
              break;
            }
          }
        }
        // console.log(catg);
        return catg;
      };

     
      Promise.all(data.map((bed) => searchSerialNumbers(bed.devicesAttachedTo)))
        .then((categories) => {
          const categoryImages = {};
          for (let i = 0; i < csvFiles.length; i++) {
            const key = csvFiles[i];
            const value = `/Devices_icons/${csvFiles[i].replace('.csv', '')}.png`;
            categoryImages[key] = value;
          }
          // Render the HTML page with the extracted data
          let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Unassign Bed</title>
              <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous"/>
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
                  justify-content: center;
                  align-items: flex-start;
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
              
                .card {

                  width:30%;
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
              
                .card-content {
                  margin-bottom: 10px;
                }
              
                .card-image {
                  text-align: center;
                }
              
                .card-image img {
                  margin:5px;
                  max-width: 20%;
                  max-height: 100px;
                }
              
                .device-form {
                  margin-top: 10px;
                }
              
                .device-dropdown {
                  margin-bottom: 5px;
                }
              
                .serial-dropdown {
                  margin-bottom: 5px;
                }
              
                .submit-button {
                  background-color: #dc3545;
                  color: #fff;
                  border: none;
                  padding: 5px 10px;
                  border-radius: 5px;
                  cursor: pointer;
                }
              
                .submit-button:hover {
                  background-color: #c82333;
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
              <h1>Assign Device</h1>
              <div class="cards">
          `;
          data.forEach((bed, index) => {
            console.log("catg:",categories[index]);
            let categoryImagesHTML = categories[index]
            .map(category => categoryImages[category])
            .filter(imageURL => imageURL) // Remove any undefined URLs
            .map(imageURL => `<img src="${imageURL}" alt="Category Image">`)
            .join('');
            console.log('categoryImagesHTML:', categoryImagesHTML);
        
            html += `
              <div class="card">
                <div class="card-content">
                  <p class="serial"><strong>Serial Number:</strong> ${bed.serial}</p>
                  <p><strong>Model:</strong> ${bed.model}</p>
                  <p><strong>Department:</strong> ${bed.department}</p>
                  <p><strong>Warranty End Date:</strong> ${bed.warrantyEndDate}</p>
                  <p><strong>Service Contract:</strong> ${bed.serviceContract}</p>
                  <p><strong>Status:</strong> ${bed.status}</p>
                  <p class="patient-assigned-field"><strong>Patient Assigned:</strong> ${bed.Patient_assigned_to_bed}</p>
                  <p><strong>Devices Attached:</strong> ${bed.devicesAttachedTo.join(', ')}</p>
                </div>
                <div class="card-image">
                  ${categoryImagesHTML}
                </div>
                <form class="device-form" action="/assign_device" method='post'>
                <input type="hidden" id="serialBed" name="serialBed" value="${bed.serial}">
                <input type="hidden" id="patientAssigned" name="patientAssigned" value="${bed.Patient_assigned_to_bed}">
                <select class="device-dropdown" name="deviceType">
                <option value="">Select Device</option>
                ${csvFiles.map((file) => `<option value="${file.replace('.csv', '')}">${file.replace('.csv', '')}</option>`).join('\n')}
              </select>
                  <h4>Select Serial:</h4>
                  <select class="serial-dropdown" name="serialNumber">
                    <option value="">Select Serial</option>
                  </select>
                  <button class="submit-button" type="submit">Submit</button>
                </form>
              </div>
            `;
          });

          html += `
              </div>
              <script src="/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
              <script>
                function fetchSerialNumbers(event) {
                  const deviceType = event.target.value;
                  const cardElement = event.target.closest('.card');
                  const serialDropdown = cardElement.querySelector('.serial-dropdown');

                  serialDropdown.innerHTML = ''; // Clear previous options

                  fetch('/serials/' + deviceType)
                    .then(response => response.json())
                    .then(data => {
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

                const deviceDropdowns = document.querySelectorAll('.device-dropdown');
                deviceDropdowns.forEach(dropdown => {
                  dropdown.addEventListener('change', fetchSerialNumbers);
                });
              </script>
            </body>
            </html>
          `;

          res.send(html);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
    })
    .on('error', (error) => {
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
});


router.post('/', (req, res) => {
  const { serialBed, deviceType, serialNumber, patientAssigned } = req.body;

  if(!serialNumber || !deviceType){res.send("Device doesn't exist!"); return;}

  var csvContent = fs.readFileSync(path.join(__dirname,"..","data",'beds.csv'), 'utf8').split('\n');
  var BEDcsvContentt = csvContent[0] + '\n';

  let headers = csvContent[0].split(',');
  let bedSerial, bedDevices;
  let notFound = true;
  let max;

  for(let i = 0; i < headers.length; i++){
    if(headers[i] == 'serial'){bedSerial = i; max = i;}
    else if(headers[i] == 'devices_attached_to'){bedDevices = i; max = i;}
  }

  for(let i = 1; i < csvContent.length; i++){
    let row = csvContent[i].split(',');
    if(max >= row.length){continue;}

    if(row[bedSerial] == serialBed){
      row[bedDevices] += `_${serialNumber}`;
      BEDcsvContentt += row.join(',') + '\n';
      notFound = false;
      continue;
    }

    BEDcsvContentt += csvContent[i] + '\n';
  }

  if(notFound){res.send("Bed doesn't exist!"); return;}

  if(fs.existsSync(path.join(__dirname,"..","data",`${deviceType}.csv`))){csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${deviceType}.csv`), 'utf8').split('\n');}
  else{res.send("Device doesn't exist!"); return;}

  let DEVcsvContent = csvContent[0] + '\n';

  headers = csvContent[0].split(',');
  let devSerial, devPatient;
  notFound = true;

  for(let i = 0; i < headers.length; i++){
    if(headers[i] == 'serial'){devSerial = i; max = i;}
    else if(headers[i] == 'patient_assigned'){devPatient = i; max = i;}
  }

  for(let i = 1; i < csvContent.length; i++){
    let row = csvContent[i].split(',');
    if(max >= row.length){continue;}

    if(row[devSerial] == serialNumber){
      row[devPatient] = patientAssigned;
      DEVcsvContent += row.join(',') + '\n';
      notFound = false;
      continue;
    }

    DEVcsvContent += csvContent[i] + '\n';
  }

  if(notFound){res.send("Device doesn't exist!"); return}

  fs.writeFileSync(path.join(__dirname,"..","data",`beds.csv`), BEDcsvContentt);
  fs.writeFileSync(path.join(__dirname,"..","data",`${deviceType}.csv`), DEVcsvContent);

  res.redirect('/assign_device');
});



module.exports = router;
