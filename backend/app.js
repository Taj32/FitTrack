import express from 'express';
import sequelize from './utils/database.js';
import authRouter from './routes/routes.js';
import exerciseRouter from './routes/exerciseRoutes.js';
import workoutRouter from './routes/workoutRoutes.js';
import friendRouter from './routes/friendRoutes.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/auth', authRouter);
app.use('/exercises', exerciseRouter);
app.use('/workouts', workoutRouter);  
app.use('/friends', friendRouter);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection to database has been established successfully.');
        return sequelize.sync();
    })
    .then(() => {
        console.log('Database synced successfully');
        app.listen(5000, () => {
            console.log(`Server is running on port 5000`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });