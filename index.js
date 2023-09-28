const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const passwordHash = require('password-hash');
const bodyParser = require('body-parser'); 

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());


app.use(bodyParser.urlencoded({ extended: true }));

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
const axios = require('axios');

// Routes

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/signup.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});
app.get('/weather', (req, res) => {
  res.sendFile(__dirname + '/public/weather.html');
});

app.post('/signupsubmit', function (req, res) {
  var hashedPassword = passwordHash.generate(req.body.password);
  db.collection('weather')
    .where('Email', '==', req.body.email) 
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.send("Hey, the account already exists in the database");
      } else {
        db.collection('weather').add({
          Username: req.body.username,
          Email: req.body.email,
          Password: hashedPassword,
        })
          .then(() => {
            res.send("Signup successful <a href=\"/login\">Login</a>");
          });
      }
    });
});

app.post('/loginsubmit', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var dataPres = false;
  db.collection('weather').get().then((docs) => {
    docs.forEach((doc) => {
      if (email == doc.data().Email && passwordHash.verify(password, doc.data().Password)) {
        dataPres = true;
      }
    });
    if (dataPres) {
      res.send("Data present in Firebase <a href=\"/weather\">Home</a>");
    } else {
      res.send("Data not present in Firebase, please login");
    }
  });
  
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
