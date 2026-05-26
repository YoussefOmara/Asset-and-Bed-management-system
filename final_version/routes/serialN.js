const express = require('express');
const fs = require('fs');
// const bodyParser = require('body-parser');
const { createObjectCsvWriter } = require('csv-writer');

const csv = require('csv-parser');
// const router = require('./assign_device');
const path = require('path');

const router = express.Router();



// GET route '/serials/:deviceType'
router.get('/:deviceType', (req, res) => {
  const deviceType = req.params.deviceType;
  const filePath = `data/${deviceType}.csv`;
  const serialNumbers = new Set();

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      if(row.patient_assigned===''){
        serialNumbers.add(row.serial);

      }
        // cons
    })
    .on('end', () => {
      const uniqueSerialNumbers = Array.from(serialNumbers);
      console.log("5555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555", uniqueSerialNumbers)
      res.json({ serialNumbers: uniqueSerialNumbers });
    })
    .on('error', (error) => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while reading the CSV file.' });
    });
});

module.exports=router;