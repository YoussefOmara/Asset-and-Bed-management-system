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


router.get('/', (req, res) => {
  // Read the beds.csv file
  const data = [];
  fs.createReadStream(path.join(__dirname,'..','data','beds.csv'))
    .pipe(csv())
    .on('data', (row) => {
      // Check conditions: status equals FF and Patient_assigned_to_bed is not empty
      if (row.status === 'FF' && row.Patient_assigned_to_bed === '') {
        // Extract the desired data from the row
        const { serial, model, department, warrantyEndDate, serviceContract, status } = row;
        data.push({ serial, model, department, warrantyEndDate, serviceContract, status });
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
            <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous"/>
            <title>Assign Bed</title>
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
            .card-container {
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

      <h1><span>Assign</span> Bed</h1>

        <div id="cardsContainer" class="card-container">
      `;

      // Generate the cards using the extracted data
      data.forEach((cardData) => {
        const { serial, model, department, warrantyEndDate, serviceContract, status } = cardData;
        html += `
          <div class="card">
            <h4>Serial: ${serial}</h4>
            <p>Model: ${model}</p>
            <p>Department: ${department}</p>
            <p>Warranty End Date: ${warrantyEndDate}</p>
            <p>Service Contract: ${serviceContract}</p>
            <p>Status: ${status}</p>
            <form method="POST" action="/assign_bed">
            <input type="hidden" name="serial" value="${serial}">
            <input type="text" name="patientId" placeholder="Patient Name/ID" required>
            <button type="submit">Assign</button>
            </form>
          </div>
        `;
      });

      html += `
          </div>
          <script src="/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
        </body>
        </html>
      `;

      res.send(html);
    });
});
router.post('/', (req, res) => {
  var { serial, patientId } = req.body;

  if(/[^\w\s]/.test(patientId)){res.send("Invalid patient!"); return;}
  patientId = patientId.replace(/\s+/g,' ').trim().toLowerCase();

  var csvContent = fs.readFileSync(path.join(__dirname,"..","data",'beds.csv'), 'utf8').split('\n');
  var NEWcsvContent = csvContent[0] + '\n';

  let headers = csvContent[0].split(',');
  let bedSerial, patient;
  let notFound = true;
  let max;

  for(let i = 0; i < headers.length; i++){
    if(headers[i] == 'serial'){bedSerial = i; max = i;}
    else if(headers[i] == 'Patient_assigned_to_bed'){patient = i; max = i;}
  }

  for(let i = 1; i < csvContent.length; i++){
    let row = csvContent[i].split(',');
    if(max >= row.length){continue;}

    if(row[bedSerial] == serial){
      row[patient] = patientId;
      NEWcsvContent += row.join(',') + '\n';
      notFound = false;
      continue;
    }

    NEWcsvContent += csvContent[i] + '\n';
  }

  if(notFound){res.send("Serial doesn't exits!");}

  fs.writeFileSync(path.join(__dirname,"..","data",`beds.csv`), NEWcsvContent);

  res.redirect('/assign_bed')
});
module.exports = router;
