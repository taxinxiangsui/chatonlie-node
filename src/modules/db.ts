import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('chat_database', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
})

export = sequelize