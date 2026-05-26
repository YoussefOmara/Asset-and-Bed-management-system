const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const engineerNav = `<li class="nav-item">
<a class="nav-link active" aria-current="page" href="/engineer">Home</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewreporteng">Action Center</a>
</li>
<li class="nav-item">
<a class="nav-link" href="/viewAssets">View Assets</a>
</li>
<li class="nav-item dropdown">
<a class="nav-link dropdown-toggle" href="#" id="dropdown03" data-bs-toggle="dropdown" aria-expanded="false">Manage Assets</a>
<ul class="dropdown-menu" aria-labelledby="dropdown03">
<li><a class="dropdown-item" href="/add_asset">Add Asset</a></li>
<li><a class="dropdown-item" href="/Remove_asset">Remove Asset</a></li>
<li><a class="dropdown-item" href="/Renew_Device_Service_Contract">Renew Device Service Contract</a></li>
<li><a class="dropdown-item" href="/ppm">PPM</a></li>
</ul>
</li>`;

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
    if (req.session.isAuthenticated && (req.session.privilege === 'engineer' || req.session.privilege === 'doctor' || req.session.privilege === 'nurse')) {
        var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'ENGAssets.html')).toString('utf-8');

        if(req.session.privilege == 'engineer'){html = html.replace("{{nav}}", engineerNav);}
        else if(req.session.privilege == 'nurse'){html = html.replace("{{nav}}", nurseNav);}
        else if(req.session.privilege == 'doctor'){html = html.replace("{{nav}}", doctorNav);}

        var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));

        if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
        else{categoryList = [];}

        categoryList.push('Bed');

        var picFiles = fs.readdirSync(path.join(__dirname, '..', 'public', 'pics'));
        var pics = {};
        for(let i = 0; i < picFiles.length; i++){
            pics[picFiles[i].substr(0, picFiles[i].lastIndexOf('.')) || picFiles[i]] = picFiles[i];
        }

        var options = "";

        for(let i = 0; i < categoryList.length; i++){
            if(categoryList[i] in pics){
                options += `<div class="box" style="background: url('/pics/${pics[categoryList[i]]}');"><h1><a href="/viewAssets/${categoryList[i]}">${categoryList[i]}</a></h1></div>\n`;
            }
            else{
                options += `<div class="box" style="background: url('/pics/${pics['placeholder']}');"><h1><a href="/viewAssets/${categoryList[i]}">${categoryList[i]}</a></h1></div>\n`;
            }
            
        }
        html = html.replace("{{categories}}", options);

        res.send(html);
    }
});

router.get('/:category', (req, res) => {
    if (req.session.isAuthenticated && (req.session.privilege === 'engineer' || req.session.privilege === 'doctor' || req.session.privilege === 'nurse')) {
        var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'viewCategory.html')).toString('utf-8');

        if(req.session.privilege == 'engineer'){html = html.replace("{{nav}}", engineerNav);}
        else if(req.session.privilege == 'nurse'){html = html.replace("{{nav}}", nurseNav);}
        else if(req.session.privilege == 'doctor'){html = html.replace("{{nav}}", doctorNav);}

        var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));

        if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
        else{categoryList = [];}

        categoryList.push('Bed');

        var category = req.url.substring(1).replaceAll('%20', ' ')
        
        if(!categoryList.includes(category)){res.send("INVALID"); return;}

        html = html.replace(/{{category}}/g, category);

        var csvContent;
        if(category == 'Bed'){csvContent = fs.readFileSync(path.join(__dirname,"..","data",`beds.csv`), 'utf8').split('\n');}
        else{csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${category}.csv`), 'utf8').split('\n');}

        const headers = csvContent[0].split(',');
        var name, department, model, manufacturer, serial, status, warranty, service, location;
        var max;

        for(let i = 0; i < headers.length; i++){
            if(headers[i] == 'deviceName'){name = i; max = i;}
            else if(headers[i] == 'department'){department = i; max = i;}
            else if(headers[i] == 'model'){model = i; max = i;}
            else if(headers[i] == 'manufacturer'){manufacturer = i; max = i;}
            else if(headers[i] == 'serial'){serial = i; max = i;}
            else if(headers[i] == 'status'){status = i; max = i;}
            else if(headers[i] == 'warrantyEndDate'){warranty = i; max = i;}
            else if(headers[i] == 'service_period_in_years'){service = i; max = i;}
            else if(headers[i] == 'location'){location = i; max = i;}
        }

        var values = [];
        var departments = new Set();

        for(let i = 1; i < csvContent.length; i++){
            let row = csvContent[i].split(',');
            if(max >= row.length){continue;}

            values.push([row[name], row[department], row[location], row[model], row[manufacturer], row[serial], row[status], row[warranty], row[service]]);
            departments.add(row[department]);
        }

        let options = '';
        departments.forEach(dep => {options += `<option value="${dep}">${dep}</option>`;});

        html = html.replace(/{{category}}/g, category);
        html = html.replace("{{departments}}", options);
        html = html.replace("`{values}`", JSON.stringify(values));
        res.send(html);
    }
});

router.get('/:category/:serial', (req, res) => {
    if (req.session.isAuthenticated && (req.session.privilege === 'engineer' || req.session.privilege === 'doctor' || req.session.privilege === 'nurse')) {
        var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'assetDetails.html')).toString('utf-8');

        if(req.session.privilege == 'engineer'){html = html.replace("{{nav}}", engineerNav);}
        else if(req.session.privilege == 'nurse'){html = html.replace("{{nav}}", nurseNav);}
        else if(req.session.privilege == 'doctor'){html = html.replace("{{nav}}", doctorNav);}

        var categoryList = fs.readFileSync(path.join(__dirname, '../', 'data', 'asset.dat'));
        if(categoryList.length){categoryList = categoryList.toString('utf-8').split(',');}
        else{categoryList = [];}

        categoryList.push('Bed');

        var category = req.url.split('/');
        var serial = category[2];
        category = category[1].replaceAll('%20', ' ');

        if(!categoryList.includes(category)){res.send("INVALID category!"); return;}

        html = html.replace("{{serial}}", serial);

        var csvContent;
        if(category == 'Bed'){csvContent = fs.readFileSync(path.join(__dirname,"..","data",`beds.csv`), 'utf8').split('\n');}
        else{csvContent = fs.readFileSync(path.join(__dirname,"..","data",`${category}.csv`), 'utf8').split('\n');}

        const headers = csvContent[0].split(',');
        var serialID;

        for(let i = 0; i < headers.length; i++){
            if(headers[i] == 'serial'){serialID = i}
        }
        
        var notFound = true;
        var row;

        for(let i = 1; i < csvContent.length; i++){
            row = csvContent[i].split(',');
            if(serialID >= row.length){continue;}

            if(row[serialID] == serial){notFound = false; break}
        }

        if(notFound){res.send("INVALID serial!"); return;}

        var values = '';
        for(let i = 0; i < row.length; i++){
            if(headers[i] == 'REP_maintainancehistory'){headers[i] = "maintainance history"; row[i] = row[i].replace(/\|/g, ','); values += `<li class="list-group-item">${headers[i]}:${row[i]}</li>`; continue;}
            else if(headers[i] == 'service_period_in_years'){headers[i] = "contract service end date";}
            else if(headers[i] == 'devices_attached_to'){headers[i] = 'devices attached';}
            else if(headers[i] == 'warrantyPeriod'){continue;}
            else{headers[i] = headers[i].replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().toLowerCase()}
            
            values += `<li class="list-group-item">${headers[i]}: ${row[i]}</li>`;
        }

        html = html.replace("{{details}}", values);

        res.send(html);
    }
});
    
module.exports = router;