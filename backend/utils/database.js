import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('logindb', 'root', , {
    dialect: 'mysql',                            //Password
    host: 'localhost', 
});

export default sequelize;