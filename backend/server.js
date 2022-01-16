import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import cookieSession from 'cookie-session';
import passport from 'passport';
import cors from 'cors';
import userRoutes from './routes/usersRoutes.js';

dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static('uploads'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: false }));

// set up session cookies
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [process.env.SESSION_SECRET],
}));
app.use(passport.initialize());
app.use(passport.session());

// Handling CORS 
app.use(cors({
  origin: '*'
}));

// define routes
app.use('/api/v1/users', userRoutes);

const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

export const server = app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`)
});