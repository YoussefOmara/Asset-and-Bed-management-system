const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    if (req.session.isAuthenticated && req.session.privilege === 'admin'){
        var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'front_page_u.html')).toString('utf-8');

        var roleCount = [["admin", "engineer", "doctor", "nurse"], [0,0,0,0]];
        roleDict = {"admin": 0, "engineer": 1, "doctor": 2, "nurse": 3};

        userList = [];

        const csvContent = fs.readFileSync(path.join(__dirname,"..","data",`users.csv`), 'utf8').split('\n');
        const headers = csvContent[0].split(',');
        var username, role, status;
        var max;
      
        for(let i = 0; i < headers.length; i++){
            if(headers[i] == 'username'){username = i; max = i;}
            else if(headers[i] == 'role'){role = i; max = i;}
            else if(headers[i] == 'status'){status = i; max = i;}
        }
      
        for(let i = 1; i < csvContent.length; i++){
            let row = csvContent[i].split(',');
            if(role >= row.length){continue;}

            userList.push([row[username], row[role], row[status]]);
            if(row[role] in roleDict){roleCount[1][roleDict[row[role]]]++;}
        }

        html = html.replace('`{roleCount}`', JSON.stringify(roleCount)).replace('`{userList}`', JSON.stringify(userList));

        res.send(html);
    }
});

router.get('/manageUser/:username', (req, res) => {
    if (req.session.isAuthenticated && req.session.privilege === 'admin'){
        var username = req.url.split('/')[2].replace(/%20/g, ' ');
        var html = fs.readFileSync(path.join(__dirname, '..', 'views', 'manageUser.html')).toString('utf-8');

        const csvContent = fs.readFileSync(path.join(__dirname,"..","data",`users.csv`), 'utf8').split('\n');
        const headers = csvContent[0].split(',');
        var name, role, status;
        var max;    
    
        for(let i = 0; i < headers.length; i++){
            if(headers[i] == 'username'){name = i; max = i;}
            else if(headers[i] == 'role'){role = i; max = i;}
            else if(headers[i] == 'status'){status = i; max = i;}
        }
    
        for(let i = 1; i < csvContent.length; i++){
            let row = csvContent[i].split(',');
            if(max >= row.length){continue;}
    
            if(row[name] == username){
                let color = '#00ff00';
                let action = 'Deactivate User';

                if(row[status] == "inactive"){
                    color = '#ff0000';
                    action = 'Activate User';
                }

                let userInfo = `<div class="user-info">
                    <h2>Username:</h2>
                    <p><span>${username}</span></p>
                </div>
                <div class="user-info">
                    <h2>Role:</h2>
                    <p><span>${row[role]}</span></p>
                </div>
                <div class="user-info">
                    <h2>Status:</h2>
                    <p><span style="color: ${color};" class="highlight">${row[status]}</span></p>
                </div>
                <div class="post-button">
                    <form method="POST" action="/admin/manageUser/${username}">
                        <input type="submit" value="${action}">
                    </form>
                </div>`

                html = html.replace("{{user}}", username).replace("{{userInfo}}", userInfo);

                res.send(html)
                return;
            }
        }

        res.send("User doesn't exist!");
    }
});

router.post('/manageUser/:username', (req, res) => {
    if (req.session.isAuthenticated && req.session.privilege === 'admin'){
        var username = req.url.split('/')[2].replace(/%20/g, ' ');

        const csvContent = fs.readFileSync(path.join(__dirname,"..","data",`users.csv`), 'utf8').split('\n');
        var newCsvContent = csvContent[0]

        const headers = csvContent[0].split(',');
        var name, status;
        var max;
        var notFound = true;

        var destroy = false;

        for(let i = 0; i < headers.length; i++){
            if(headers[i] == 'username'){name = i; max = i;}
            else if(headers[i] == 'status'){status = i; max = i;}
        }
    
        for(let i = 1; i < csvContent.length; i++){
            let row = csvContent[i].split(',');
            if(max >= row.length){continue;}
    
            if(row[name] == username){
                if(row[status] == 'inactive'){row[status] = 'active';}
                else{
                    if(req.session.user == username){destroy = true;}
                    row[status] = 'inactive'; 
                }
                newCsvContent += '\n' + row.join(',');
                notFound = false;
                continue
            }

            newCsvContent += '\n' + csvContent[i];
        }
        newCsvContent += '\n';

        if(notFound){res.send("User doesn't exist!"); return;}

        fs.writeFileSync(path.join(__dirname,"..","data",`users.csv`), newCsvContent);

        if(destroy){req.session.destroy();}

        res.redirect('/admin');
    }
});

module.exports = router;