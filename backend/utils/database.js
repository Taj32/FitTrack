import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('logindb', 'root', "Easd17527!321", {
    dialect: 'mysql',                            //Password
    host: 'localhost', 
});

export default sequelize;