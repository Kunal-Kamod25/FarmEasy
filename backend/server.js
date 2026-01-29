const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

// load environment variables
dotenv.config();

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

// A simple route to check if it's working
app.get('/', (req, res) => {
    res.send("Backend running successfully...");
});

// Setting the port from .env or default to 5000
const PORT = process.env.PORT || 5000;

// This line keeps the process alive and "listening"
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    app.use('/api/auth', authRoutes);
});