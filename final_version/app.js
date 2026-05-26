const express = require('express');
const session = require('express-session');
const loginRouter = require('./routes/login');
const fullDetailRouter = require('./routes/full_detials') ;
const path = require("path");
const bodyParse = require('body-parser');
const assig_device = require('./routes/assign_device');
const remove_serialN=require("./routes/remove_serialN");
const remove_dev=require('./routes/remove_assigned_device');
// const remove_dev=require('./routes/remove_assigned_device');
const view_edit_rep=require('./routes/view_edit_Report');
const add_asset=require('./routes/add_asset');
// const ad_cat=require(./)
const view_rep=require('./routes/view_report');
const assig_bed=require('./routes/assign_bed');
const serialN=require("./routes/serialN");
const remove_asset=require('./routes/remove_asset');
// const assig_device = require('./routes/assign_device');
const remove_beds=require('./routes/remove_bed');
// const remove_dev=require('./routes/remove_assigned_device');

const Eng=require('./routes/Eng');
const Department_gen=require('./routes/Current_DeparementAssets');
const submitReportRouter = require('./routes/submitReportRouter');
const Renew_Device_Service_Contract=require('./routes/Renew_Device_Service_Contract');
// const Add_AssetR= // path to route 
const app = express();
app.use(bodyParse.urlencoded({ extended: true }));
// app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());
app.use(express.static(path.join("public")));
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(path.join("views")));

// Set up session middleware
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true
}));

const checkPrivilege = (req, res, next) => {
  // req.currentPath = req.url;
  if (req.session.isAuthenticated && (req.session.privilege === 'engineer' || req.session.privilege === 'doctor' || req.session.privilege === 'nurse')) {
    next();
  } else {
    res.redirect('/login');
  }
};

const checkAnyPrivilege = (req, res, next) => {
  // req.currentPath = req.url;
  if (req.session.isAuthenticated && (req.session.privilege === 'admin' || req.session.privilege === 'engineer' || req.session.privilege === 'doctor' || req.session.privilege === 'nurse')) {
    next();
  } else {
    res.redirect('/login');
  }
};

const checkNursePrivilege = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.privilege === 'nurse') {
    next(); // Allow access to the next middleware or route handler
  } else {
    res.redirect('/login');
  }
};
const checkEngineerPrivilege = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.privilege === 'engineer') {
    next(); // Allow access to the next middleware or route handler
  } else {
    res.redirect('/login');
  }
};

const checkDoctorPrivilege = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.privilege === 'doctor') {
    next();
  } else {
    res.redirect('/login');
  }
};

const checkDNPrivilege = (req, res, next) => {
  if (req.session.isAuthenticated &&  (req.session.privilege === 'doctor' || req.session.privilege === 'nurse')) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware to check admin privilege
const checkAdminPrivilege = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.privilege === 'admin') {
    next(); // Allow access to the next middleware or route handler
  } else {
    res.redirect('/login');
  }
};


// app.use('/add asset route ',checkEngineerPrivilege, Add_AssetR);
// app.use('/')
app.use('/assign_device',checkNursePrivilege, assig_device);
app.use("/serials",checkNursePrivilege,serialN);
app.use('/remove_assigned_device',checkNursePrivilege,remove_dev);
app.use("/remove_serials",checkNursePrivilege,remove_serialN);
// app.use('/remove_assigned_device',checkNursePrivilege,remove_dev);
app.use('/assign_bed',checkNursePrivilege, assig_bed);
app.use('/remove_bed',checkNursePrivilege,remove_beds);
app.use('/engineer',checkEngineerPrivilege,Eng)
app.use('/nurse',checkNursePrivilege,require('./routes/nurse'))
app.use('/doctor',checkDoctorPrivilege,require('./routes/doctor'))
app.use('/admin',checkAdminPrivilege,require('./routes/admin'))
app.use('/viewAssets',checkPrivilege,require('./routes/viewAssets'))
app.use('/viewreport', checkDNPrivilege, view_rep);
app.use('/General_Medicine',checkPrivilege,Department_gen);
app.use('/Cardiology',checkPrivilege,Department_gen);
// app.use()
app.use('/Renew_Device_Service_Contract',checkEngineerPrivilege,Renew_Device_Service_Contract);
app.use('/remove_asset',checkEngineerPrivilege,remove_asset);
app.use('/add_asset', checkEngineerPrivilege, add_asset);
app.use('/fullDetail', checkPrivilege, fullDetailRouter);
app.use('/viewreporteng', checkEngineerPrivilege, view_edit_rep);
app.use('/Submit_report',checkDNPrivilege, submitReportRouter);
app.use('/login', loginRouter);
app.use('/createAccount', checkAdminPrivilege, require('./routes/createAccount'));
app.use('/ppm', checkEngineerPrivilege, require('./routes/ppm_checking'));
app.use('/changePass', checkAnyPrivilege, require('./routes/changePass'));


app.get('/logout', function(req, res) {
  if(req.session.isAuthenticated){req.session.destroy();}
  res.redirect('/login');
});

app.get('*', function(req, res) {
  res.redirect('/login');
});


// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
