"use strict";
const express = require('express');
const DB = require('./db');
const config = require('./config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const db = new DB("sqlitedb")
const app = express();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain)

router.post('/register', function(req, res) {
    db.insert([
      req.body.name,
      req.body.email,
      bcrypt.hashSync(req.body.password, 8)
    ],
    function (err) {
        if (err) return res.status(500).send("There was a problem registering the user.")
        db.selectByEmail(req.body.email, (err,user) => {
          if (err) return res.status(500).send("There was a problem getting user")
          
          let token = jwt.sign(
              { 
                id: user.id 
              }, 
              config.secret, 
              {
                expiresIn: 86400 // expires in 24 hours
              });
          
          res.status(200).send(
            { 
              auth: true, 
              token: token, 
              user: user 
            });
        }); 
    }); 
  });

router.post('/register-admin', function(req, res) {
  db.insertAdmin([
      req.body.name,
      req.body.email,
      bcrypt.hashSync(req.body.password, 8),
      1
  ],
  function (err) {
    if (err) return res.status(500).send("There was a problem registering the user.")
    
    db.selectByEmail(req.body.email, (err,user) => {
      if (err) return res.status(500).send("There was a problem getting user")
      let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 // expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token, user: user });
    }); 
  }); 
});

router.post('/login', (req, res) => {
  db.selectByEmail(req.body.email, (err, user) => {
    if (err) return res.status(500).send('Error on the server.');
    
    if (!user) return res.status(404).send('No user found.');
    
    let passwordIsValid = bcrypt.compareSync(req.body.password, user.user_pass);
    
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    
    let token = jwt.sign(
      { id: user.id }, 
      config.secret, 
      { expiresIn: 86400 // expires in 24 hours
      });
    
    res.status(200).send({
      auth: true,
      token: token,
      user: user
    });
  });
})

router.get('/teams', (req, res) => {
  db.selectAllTeams((err, teams) => {
    if (err) return res.status(500).send('Error on the server.');
    res.status(200).send(teams);
  });
});

router.get('/results/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  db.selectResultsByEvent(eventId, (err, results) => {
    if (err) return res.status(500).send('Error on the server.');
    res.status(200).send(results);
  });
});

router.get('/summary/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  db.selectSummaryByEvent(eventId, (err, results) => {
    if (err) return res.status(500).send('Error on the server.');
    res.status(200).send(results);
  });
});

router.get('/events', (req, res) => {
  db.selectAllEvents((err, events) => {
    if (err) return res.status(500).send('Error on the server.');
    res.status(200).send(events);
  });
  
});

router.get('/groupevent', (req, res) => {
  db.selectAllEventGroupNames((err, events) => {
    if (err) return res.status(500).send('Error on the server.');
    res.status(200).send(events);
  });
});
router.post('/results/:id', (req, res) => {
  const results = req.body.results;
  const promises = [];
  results.forEach(result => {
    const promise = new Promise((resolve, reject) => {
      db.updateResult(result, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    promises.push(promise);
  });

  Promise.all(promises)
    .then(() => {
      res.status(200).send('Results updated successfully.');
    })
    .catch((err) => {
      res.status(500).send('Error updating results: ' + err.message);
    });
  db.updateSummary((err) => {
    if (err) {
      console.error('Ошибка при обновлении итогов:', err);
    } else {
      console.log('Итоги успешно обновлены');
    }
  });
});
app.use(router)
let port = process.env.PORT || 3000;
let server = app.listen(port, function() {
    console.log('Express server listening on port ' + port)
});