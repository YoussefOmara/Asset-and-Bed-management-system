

function parseCSV(csvFile) {
    const lines = csvFile.split("\n");
    // console.log(lines);
    const headers = lines[0].split(",");
    console.log(headers);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "") {
        continue; // Skip empty lines
      }
      
      const values = line.split(",");
      const row = {};
      
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        const value = values[j];
        row[header] = value;
      }
      
      data.push(row);
    }
    
    return data;
}

const Report = "Report.csv";
const devices = ["EKG.csv", "AED.csv"];

function parseDepartmentData(csvFiles) {
  const departmentData = [];
  
  csvFiles.forEach(csvFile => {
    const data = parseCSV(csvFile);
    
    data.forEach(row => {
      const department = row.department;
      const existingDepartment = departmentData.find(d => d.department === department);
      
      if (existingDepartment) {
        existingDepartment.count++;
      } else {
        departmentData.push({ department, count: 1 });
      }
    });
  });
  
  return departmentData;
}

function parseStatusData(csvFiles) {
  const statusData = [];
  
  csvFiles.forEach(csvFile => {
    const data = parseCSV(csvFile);
    
    data.forEach(row => {
      const status = row.status;
      const existingStatus = statusData.find(s => s.status === status);
      
      if (existingStatus) {
        existingStatus.count++;
      } else {
        statusData.push({ status, count: 1 });
      }
    });
  });
  
  return statusData;
}

function parseReportStatusData(reportCSVFile) {
  const reportStatusData = [];
  
  const data = parseCSV(reportCSVFile);
  
  data.forEach(row => {
    const status = row.status;
    const existingStatus = reportStatusData.find(s => s.status === status);
    
    if (existingStatus) {
      existingStatus.count++;
    } else {
      reportStatusData.push({ status, count: 1 });
    }
  });
  
  return reportStatusData;
}

const departmentData = parseDepartmentData(devices);
console.log(departmentData);

const statusData = parseStatusData(devices);
console.log(statusData);

const reportStatusData = parseReportStatusData(Report);
console.log(reportStatusData);