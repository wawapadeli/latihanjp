require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const kursusRoutes = require('./routes/kursus');
const kpiRoutes = require('./routes/kpi');
const stafRoutes = require('./routes/staf');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kursus', kursusRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/staf', stafRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', masa: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ mesej: 'Endpoint tidak dijumpai.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
