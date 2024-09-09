import express from 'express';
import sequelize from './utils/database.js';
import authRouter from './routes/routes.js';
import exerciseRouter from './routes/exerciseRoutes.js';
import workoutRouter from './routes/workoutRoutes.js';
import friendRouter from './routes/friendRoutes.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var port = process.env.PORT || 1337;
//app.set('view engine', 'html');



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


app.get('/', (req, res) => res.json('My api is running! :)'));

//Testing for azure
// app.render('sample', function(err, html) {
//     console.log(html);
// });

app.get('/sample', function (req, res) {
    res.render('sample');
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection to database has been established successfully.');
        return sequelize.sync();
    })
    .then(() => {
        console.log('Database synced successfully');
        app.listen(port, () => {
            console.log(`Server is running on port 1337`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });