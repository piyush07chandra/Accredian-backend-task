const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT= 5000

app.use(express.json());
app.use(cors())
// app.use(cors({
//   origin: 'https://acredianfrontend.netlify.app/',
//   methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
// }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Piyush@1234',
  database: 'signinlogin',
   port: 3306,
  connectTimeout: 20000,
});

db.connect((err) => {
  if (err) {
    console.error('Unable to connect to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.get('/',(req,res)=>{
  res.send("deployed")
})

app.post('/signup', async (req, res) => {
  
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
    };
    

// Check if the email already exists
const checkEmailExistsSql = 'SELECT * FROM users WHERE email = ?';
db.query(checkEmailExistsSql, [user.email], (err, results) => {
  if (err) {
    console.error('Error checking email existence:', err);
    res.status(500).send('Error checking email existence');
    return;
  }

  if (results.length > 0) {
    res.status(400).send('Email already exists');
    return;
  }


    db.query('INSERT INTO users SET ?', user, (err, result) => {

      if (err) {
        console.error(err);
        res.status(500).json({ message: 'internel server error' });
      } else {
        res.status(201).json({ message: 'User created successfully' });
      }
  });
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.post('/login', async (req, res) => {
 
  const { email, password } = req.body;

  // Check if the email exists
  const checkEmailExistsSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailExistsSql, [email], async (err, results) => {
    if (err) {
      console.error('Error checking email existence:', err);
      res.status(500).send('Error checking email existence');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('Email does not exist');
      return;
    }

    try {
      const user = results[0];

      //compare the password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // if email and password are correct 
        res.status(200).send('Login successful');
      } else {
        res.status(401).send('Incorrect password');
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      res.status(500).send('Error comparing passwords');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});