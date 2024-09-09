import { Sequelize } from 'sequelize';


const sequelize = new Sequelize(,  {
    dialect: 'mssql',
    host: 'mygymserver.database.windows.net',
    //database: 'logindb',
    port: 1433,  // SQL Server typically uses port 1433
    dialectOptions: {
        options: {
            encrypt: true,
            trustServerCertificate: false
        }
    },
    schema: 'logindb'  // custom schema

});

export default sequelize;
