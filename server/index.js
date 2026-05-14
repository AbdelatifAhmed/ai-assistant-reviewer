require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Interview Pro API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await database.connect();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
