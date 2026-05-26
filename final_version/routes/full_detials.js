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
router.use(express.static(path.join("public")))
router.post('/', (req, res) => {
    const { serial } = req.body;
    let assetFound = false;

    fs.createReadStream('data/AED.csv')
    .pipe(csv())
    .on('data', (row) => {
      if (row.serial === serial) {
        // Perform any necessary actions with the matched row
        assetFound = true;

        // Generate HTML response
        const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Asset Details</title>
            <link rel="stylesheet" type="text/css" href="asset-details.css">
        </head>
        <body>
            <h1>Asset Details</h1>
            <ul>
                <li><strong>Serial:</strong> ${row.serial}</li>
                <li><strong>deviceName:</strong> ${row.deviceName}</li>
                <li><strong>department:</strong> ${row.department}</li>
                <li><strong>manufacturer:</strong> ${row.manufacturer}</li>
                <li><strong>manufacturingDate:</strong> ${row.manufacturingDate}</li>
                <li><strong>model:</strong> ${row.model}</li>
                <li><strong>status:</strong> ${row.status}</li>
                <li><strong>warrantyPeriod:</strong> ${row.warrantyPeriod}</li>
                <li><strong>warrantyEndDate:</strong> ${row.warrantyEndDate}</li>
                <li><strong>agent:</strong> ${row.agent}</li>
                <li><strong>countryOfOrigin:</strong> ${row.countryOfOrigin}</li>
                <li><strong>purchasingDate:</strong> ${row.purchasingDate}</li>
                <li><strong>installationDate:</strong> ${row.installationDate}</li>
                <li><strong>purchasingPrice:</strong> ${row.purchasingPrice}</li>
                <li><strong>purchasingMethod:</strong> ${row.purchasingMethod}</li>
                <li><strong>serviceContract:</strong> ${row.serviceContract}</li>
                <li><strong>serviceContractCompany:</strong> ${row.serviceContractCompany}</li>
                <li><strong>serviceContractValue:</strong> ${row.serviceContractValue}</li>
                <li><strong>REP_maintainancehistory:</strong> ${row.REP_maintainancehistory}</li>
                
                <!-- Add more details here -->
            </ul>
        </body>
        </html>
        `;

        // Save the HTML response to a file
        fs.writeFile('views/asset-details.html', htmlResponse, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
          } else {
            res.sendFile(path.join(__dirname,"..", 'views', 'asset-details.html'));
          }
        });
      }
    })
    .on('end', () => {
      if (!assetFound) {
        res.status(404).send('Asset not found');
      }
    });
});


module.exports=router;