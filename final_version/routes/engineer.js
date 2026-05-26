const express = require('express');
const router = express.Router();
const bodyparse = require('body-parser');

router.use(bodyparse.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  let message = '';

  // Check user type to display appropriate message
  switch (req.session.userType) {
    case 'engineer':
      message = 'Welcome, engineer!';
      break;
    case 'doctor':
      message = 'Welcome, doctor!';
      break;
    default:
      message = 'Welcome!';
  }

  res.send(`
    <h1>${message}</h1>
    <p>You are logged in as ${req.session.username}.</p>
  `);
});

module.exports = router;