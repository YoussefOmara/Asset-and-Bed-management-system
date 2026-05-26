const reservedDevices = [
    {
      deviceName: 'ECG Monitor',
      patientName: 'John Smith',
      reservedAt: '2023-02-21 10:00:00',
      reservedUntil: '2023-02-21 11:00:00'
    },
    {
      deviceName: 'Ventilator',
      patientName: 'Mary Johnson',
      reservedAt: '2023-02-21 12:00:00',
      reservedUntil: '2023-02-21 14:00:00'
    },
    {
      deviceName: 'Blood Pressure Monitor',
      patientName: 'James Williams',
      reservedAt: '2023-02-21 15:00:00',
      reservedUntil: '2023-02-21 16:30:00'
    }
  ];
  
  const reservedDevicesTable = document.getElementById('reserved-devices-table');
  
  function displayReservedDevices() {
    reservedDevicesTable.innerHTML = '';
    for (let device of reservedDevices) {
      let row = document.createElement('tr');
      row.innerHTML = `
        <td>${device.deviceName}</td>
        <td>${device.patientName}</td>
        <td>${device.reservedAt}</td>
        <td>${device.reservedUntil}</td>
      `;
      reservedDevicesTable.appendChild(row);
    }
  }
  
  const deviceCounts = {
    'ECG Monitor': 0,
    'Ventilator': 0,
    'Blood Pressure Monitor': 0
  };
  
  for (let device of reservedDevices) {
    deviceCounts[device.deviceName]++;
  }
  
  const deviceNames = Object.keys(deviceCounts);
  const deviceCountsData = deviceNames.map(name => deviceCounts[name]);
  
  const devicesChart = new Chart(document.getElementById('devices-chart'), {
    type: 'bar',
    data: {
      labels: deviceNames,
      datasets: [{
        label: 'Reserved Devices',
        data: deviceCountsData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
          }]
          },
          options: {
          scales: {
          y: {
          beginAtZero: true
          }
          }
          }
          });
displayReservedDevices();
////////////////


const admissionsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Admissions',
        data: [100, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };
  
  const admissionsChart = new Chart(document.getElementById('admissions-chart'), {
    type: 'line',
    data: admissionsData,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  const dischargesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Discharges',
        data: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };
  
  const dischargesChart = new Chart(document.getElementById('discharges-chart'), {
    type: 'line',
    data: dischargesData,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  const occupancyData = {
    labels: ['Emergency', 'Surgery', 'Pediatrics', 'ICU'],
    datasets: [
      {
        label: 'Occupied Beds',
        data: [20, 30, 15, 10],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Available Beds',
        data: [80, 70, 85, 90],
        backgroundColor: 'rgba(255, 206,54,162)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
        }
    ]
  };



const occupancyChart = new Chart(document.getElementById('occupancy-chart'), {
                type: 'bar',
                data: occupancyData,
                options: {
                scales: {
                y: {
                beginAtZero: true
                }
                }
                }
                });