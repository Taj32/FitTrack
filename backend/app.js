import express from 'express';
import sequelize from './utils/database.js';
import authRouter from './routes/routes.js';  // Rename this import to be more specific
import exerciseRouter from './routes/exerciseRoutes.js';  // Add this new import
import workoutRouter from './routes/workoutRoutes.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Use separate routers for auth and exercises
app.use('/auth', authRouter);  // Assuming your current routes are auth-related
app.use('/exercises', exerciseRouter);  // New exercise routes
app.use('/workouts', workoutRouter);  // Add this new line


// Error handling middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});

sequelize.sync()
    .then(() => {
        console.log('Database synced successfully');
        app.listen(5000, () => {
            console.log(`Server is running on port 5000`);
        });
    })
    .catch(err => {
        console.error('Unable to sync database:', err);
    });