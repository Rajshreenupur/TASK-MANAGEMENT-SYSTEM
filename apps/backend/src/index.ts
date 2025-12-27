import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

