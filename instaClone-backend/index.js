import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './config/db.js';
import authRoutes from './routes/Auth.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import storyRoutes from './routes/stories.js';
import notificationRoutes from './routes/notifications.js';

// ES modules mein __dirname ke liye
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Sabse pehle dotenv config karo
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Routes
app.get('/', (req, res) => {
    res.send(`Server is running on port ${PORT}`);
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Post Routes
app.use('/api/posts', postRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Story Routes
app.use('/api/stories', storyRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// 4. Database connection aur server start
const startServer = async () => {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
