
const beds = [
  { bedNumber: 1, department: 'Emergency', room: 'A101', status: 'occupied' },
  { bedNumber: 2, department: 'ICU', room: 'B202', status: 'available' },
  { bedNumber: 3, department: 'Pediatrics', room: 'C303', status: 'available' },
  { bedNumber: 4, department: 'Surgery', room: 'D404', status: 'occupied' },
  { bedNumber: 5, department: 'Oncology', room: 'E505', status: 'available' },
];

const bedsTable = document.getElementById('beds-table');

// function to generate a table row for a bed
function generateBedRow(bed) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${bed.bedNumber}</td>
    <td>${bed.department}</td>
    <td>${bed.room}</td>
    <td class="${bed.status}">${bed.status}</td>
    <td><button class="edit-button" data-bed-number="${bed.bedNumber}">Edit</button></td>
  `;
  return tr;
}

// function to update the table with the current state of the beds array
function updateBedsTable() {
  bedsTable.innerHTML = '';
  beds.forEach(bed => {
    bedsTable.appendChild(generateBedRow(bed));
  });
  const editButtons = document.querySelectorAll('.edit-button');
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const bedNumber = button.dataset.bedNumber;
      // Do something with the bed number, e.g. display a form to edit the bed's condition
      console.log(`Editing bed ${bedNumber}`);
    });
  });
}

// update the table on page load
updateBedsTable();

// add bed form and button
const addBedButton = document.getElementById('add-bed-button');
const addBedForm = document.getElementById('add-bed-form');
const submitBedButton = document.getElementById('submit-bed-button');

addBedButton.addEventListener('click', () => {
  addBedForm.style.display = 'block';
});

submitBedButton.addEventListener('click', () => {
  const bedNumber = parseInt(document.getElementById('bed-number').value);
  const department = document.getElementById('department').value;
  const room = document.getElementById('room').value;
  const status = 'available';
  beds.push({ bedNumber, department, room, status });
  addBedForm.style.display = 'none';
  updateBedsTable();
});

// fix edit button functionality
const editButtons = document.querySelectorAll('.edit-button');
editButtons.forEach(button => {
  button.addEventListener('click', () => {
    const bedNumber = button.dataset.bedNumber;
    // Do something with the bed number, e.g. display a form to edit the bed's condition
    console.log(`Editing bed ${bedNumber}`);
  });
});

