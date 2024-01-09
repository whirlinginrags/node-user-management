const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const config = {
  host: 'db',
  user: 'root',
  database: 'test',
  password: 'Admin123'
};

let connection;

const connectWithRetry = async () => {
  try {
    connection = await mysql.createConnection(config);
    console.log('Successfully connected to the database.');
  } catch (err) {
    console.log('Unable to connect to the database. Retrying in 5 seconds...');
    console.error(err)
    await bluebird.delay(5000);
    return connectWithRetry();
  }

  // Define a route to retrieve all users
  app.get('/all', (req, res) => {
    connection.query(
      'SELECT * FROM `user`',
      function(err, results, fields) {
        console.log(results); // results contains rows returned by server
        res.status(200).json(results);
      }
    ) 
  });

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  app.get('/health', (req, res) => {
    res.sendStatus(200);
  });

  app.post('/add', (req, res) => {
    const { name, surname, email, password } = req.query;

    connection.query('INSERT INTO user (name, surname, email, password) VALUES (?,?,?,?)', [name, surname, email, password],(error, results) => {
      if (error){
        return res.status(500).json({ error: error });
      }
    });
    res.sendStatus(200);
  });

  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
}

connectWithRetry();