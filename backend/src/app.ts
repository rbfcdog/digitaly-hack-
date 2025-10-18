import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import actionsRouter from './api/routes/actions.router.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL || "https://nasa-vercel-app.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/actions', actionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
