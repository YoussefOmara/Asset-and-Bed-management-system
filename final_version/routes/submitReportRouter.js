const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const nurseNav = `<li class="nav-item">
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
</li>`;

const doctorNav = `<li class="nav-item">
<a class="nav-link active" aria-current="page" href="/doctor">Home</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/Submit_report">Report Issue</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewreport">View Reports</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewAssets">View Assets</a>
</li>`;

router.get('/', (req, res) => {
    if (req.session.isAuthenticated && (req.session.privilege === 'nurse' || req.session.privilege === 'doctor')) {
        var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'Submit_report.html')).toString('utf-8');

        if(req.session.privilege == 'nurse'){html = html.replace("{{nav}}", nurseNav);}
        else {html = html.replace("{{nav}}", doctorNav);}

        var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
        if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
        else{categoryList = [];}
        categoryList.push('Bed');
    
        var options = "";
        var values = "{";
        for(let i = 0; i < categoryList.length; i++){
          options += `<option value="${categoryList[i]}">${categoryList[i]}</option>\n`;
    
          var csvContent;
          if(categoryList[i] == 'Bed'){csvContent = fs.readFileSync(path.join(__dirname,"..","data",`beds.csv`), 'utf8').split('\n');}
          else{csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${categoryList[i]}.csv`), 'utf8').split('\n');}
    
          values += `'${categoryList[i]}': [`;
    
          const headers = csvContent[0].split(',');
          var serial;
          for(let i = 0; i < headers.length; i++){if(headers[i] == 'serial'){serial = i;}}
    
          for(let i = 1; i < csvContent.length; i++){
            let row = csvContent[i].split(',');
            if(serial >= row.length){continue;}
    
            values += `'${row[serial]}',`;
          }
          values += '],'
        }
        values += '}';
        
        html = html.replace("{{role}}", req.session.privilege);
        html = html.replace("{{categories}}", options);
        html = html.replace("`{values}`", values);

        res.send(html);
    }
});

router.post('/', (req, res) => {
    if (req.session.isAuthenticated && (req.session.privilege === 'nurse' || req.session.privilege === 'doctor')) {
        var {category, serial, description} = req.body;

        description = description.replace(/\n|\r?\n/g, '{nl}').replace(/,/g, '|');

        fs.appendFileSync(path.join(__dirname, '../', 'data', 'Report.csv'), `${new Date().valueOf()},${category},${serial},${description},${req.session.user},open\n`)
        res.redirect(`/${req.session.privilege}`)
    }
});

module.exports = router;