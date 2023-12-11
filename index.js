const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT=process.env.PORT || 5000

app.use(express.json());
app.use(cors({
  origin: 'https://acredianfrontend.netlify.app/',
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Piyush@1234',
  database: 'signinlogin',
  connectTimeout: 20000,
});

db.connect((err) => {
  if (err) {
    console.error('Unable to connect to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.post('/signup', async (req, res) => {
  res.send('kkjkjk')
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
    };
    

// Check if the email already exists
db.query('SELECT * FROM users WHERE email = ?', [user.email], (err, results) => {
  if (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  if (results.length > 0) {
    return res.status(500).json({ message: 'Email already exists. Choose a different email.' });
    
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
  try {
    const email = req.body.email;
    const password = req.body.password;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
      } else if (results.length > 0) {
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (validPassword) {
          res.status(200).json({ message: 'Login successful' });
        } else {
          res.status(401).json({ message: 'Invalid email or password' });
        }
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});