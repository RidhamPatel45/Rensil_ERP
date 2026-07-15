import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Database Connection & Auto-Seeding
// ---------------------------------------------------------------------------
await connectDB();

// ---------------------------------------------------------------------------
// Middlewares
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api', apiRouter);

// ---------------------------------------------------------------------------
// Global Error Handler Middleware
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 Rensil ERP Backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}\n`);
});
