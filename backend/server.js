const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authenticate = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);


app.get('/api/transactions/ledgers', authenticate, (req, res) => res.json([]));
app.get('/api/planning/proposals', authenticate, (req, res) => res.json([]));
app.get('/api/admin/rates', authenticate, (req, res) => res.json([]));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Modular SCMS Backend Engine online on port ${PORT}`));