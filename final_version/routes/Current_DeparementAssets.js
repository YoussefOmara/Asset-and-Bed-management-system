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
router.use(express.static(path.join("views")));
router.use(express.static(path.join("data")));
router.use(express.static(path.join("public")));
router.get('/', (req, res) => {
    const currentPath = req.originalUrl; // Access the current URL path from the request object
    const patH=[currentPath.indexOf("/")+1,currentPath.lastIndexOf("/")];
    const path_substring=currentPath.substring(patH[0],patH[1]);    
    // console.log(currentPath[currentPath.lastIndexOf("/")-1]);
    // const department = req.path.substring(starting_letter_index,string_last_letter);
    // console.log(department);
     // Extract the department name from the URL path
  
    const csvFiles = ['data/AED.csv', 'data/EKG.csv']; // List of CSV files to process
    const devices = [];
  
    const processCSV = (filePath) => {
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            // Check if the device category matches the current department
            if (data.department === path_substring) {
                console.log(data.department);
              devices.push(data);
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    };
  
    const processAllCSVs = async () => {
      try {
        for (const filePath of csvFiles) {
          await processCSV(filePath);
        }
  
        // Generate the HTML content with the matching devices
        const cards = devices.map((device) => {
          return `
            <div class="card">
              <h3>${device.deviceName}</h3>
              <p>${device.description}</p>
              <p>Manufacturer: ${device.manufacturer}</p>
              <p>Model: ${device.model}</p>
              <p>Serial: ${device.serial}</p>
              <p>Status: ${device.status}</p>
            </div>
          `;
        });
  
        // Create the final HTML page with the populated cards
        const html = `
          <html>
            <head>
              <title>${path_substring} Assets</title>
              <style>
              /* Add your custom CSS styles here */
              .card-container {
                display: flex;
                flex-wrap: wrap;
              }
              
              .card {
                width: 300px;
                margin: 10px;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: #f5f5f5;
              }
              </style>
            </head>
            <body>
              <h1>${path_substring} Assets</h1>
              <div class="card-container">
                ${cards.join('')}
              </div>
            </body>
          </html>
        `;
  
        // Set the appropriate headers and send the HTML page as the response
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } catch (error) {
        // Handle any errors that occurred during processing
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    };
  
    processAllCSVs();
  });
  
  module.exports = router;