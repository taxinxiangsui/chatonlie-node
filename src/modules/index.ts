import sequelize = require('./db')
import Message = require('./message')
import User = require('./user')
const initDB = async () => {
    try {
        User.hasMany(Message, {
            foreignKey: 'uid'
        })
        await sequelize.sync({ alter: true })
        console.log('模型已同步');
        sequelize.authenticate()
    } catch (error) {
        console.log(error);
        return Promise.reject()
    }
}
export = initDB



