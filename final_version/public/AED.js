function displayCard(deviceName, department, model, manufacturer, serial, status, warrantyEndDate, serviceContract) {
    const cardContainer = document.getElementById('cardContainer');

    // Clone the card template
    const cardTemplate = document.getElementById('cardTemplate');
    const card = cardTemplate.cloneNode(true);
    card.classList.remove('d-none'); // Remove 'd-none' class to make the card visible
  
    // Update the content of each element with the provided data
    card.querySelector('#deviceName').textContent = deviceName;
    card.querySelector('#department').textContent = 'Department: ' + department;
    card.querySelector('#model').textContent = 'Model: ' + model;
    card.querySelector('#manufacturer').textContent = 'Manufacturer: ' + manufacturer;
    card.querySelector('#serial').textContent = 'Serial: ' + serial;
    card.querySelector('#status').textContent = 'Status: ' + status;
    card.querySelector('#warrantyEndDate').textContent = 'Warranty End Date: ' + warrantyEndDate;
    card.querySelector('#serviceContract').textContent = 'Service Contract: ' + serviceContract;
  
    cardContainer.appendChild(card);
  }

  function readCsv() {
    // Assuming you have a function to read the CSV file and store the data in 'csvData' array
  
    // Call the displayCard function for each data entry in the CSV
    fetch('/data/AED.csv')
    .then(response => response.text())
    .then(csvText => {
      // Parse the CSV data
      const csvRows = csvText.split('\n');
      const headers = csvRows[0].split(',');
      console.log(headers);
      csvData = [];

      // Iterate over the rows and create data objects
      for (let i = 1; i < csvRows.length; i++) {
        const values = csvRows[i].split(',');

        // Create an object using headers as keys and row values as values
        const dataEntry = {};
        for (let j = 0; j < headers.length; j++) {
          dataEntry[headers[j]] = values[j];
        }

        csvData.push(dataEntry);
      }

      // Call the displayCard function for each data entry in the CSV
      for (const data of csvData) {
        displayCard(
          data.deviceName,
          data.department,
          data.model,
          data.manufacturer,
          data.serial,
          data.status,
          data.warrantyEndDate,
          data.serviceContract
        );
      }
    })
    .catch(error => {
      console.error('Error fetching or parsing CSV file:', error);
    });
  }

  readCsv();