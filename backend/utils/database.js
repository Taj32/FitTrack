import { Sequelize } from 'sequelize';


const sequelize = new Sequelize('logindb', 'azureuser', 'Easd17527!321',  {
    dialect: 'mssql',
    host: 'mygymserver.database.windows.net',
    port: 1433,
    dialectOptions: {
        options: {
            encrypt: true,
            trustServerCertificate: false
        },
        useUTC: false,  // Use local time instead of UTC
        dateStrings: true,  // Send dates as strings to prevent conversion issues
    },
    //timezone: '+00:00', // Set to your timezone if different
    schema: 'logindb',  // custom schema
    logging: console.log, // This will log SQL queries for debugging
});

export default sequelize;
