const express = require('express');
const fs = require('fs');
// const bodyParser = require('body-parser');
const { createObjectCsvWriter } = require('csv-writer');

const csv = require('csv-parser');
// const router = require('./assign_device');
const path = require('path');

const router = express.Router();



// GET route '/serials/:deviceType'
router.get('/:deviceType/:patientID', (req, res) => {
    const deviceType = req.params.deviceType;
    const patientID = req.params.patientID;
    const filePath = `data/${deviceType}.csv`;
    const serialNumbers = new Set();
  
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.patient_assigned === patientID) {
          const serial = row.serial.split('_');
          serial.forEach((s) => serialNumbers.add(s));
        }
      })
      .on('end', () => {
        const uniqueSerialNumbers = Array.from(serialNumbers);
        res.json({ serialNumbers: uniqueSerialNumbers });
      })
      .on('error', (error) => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while reading the CSV file.' });
      });
  });
module.exports=router;