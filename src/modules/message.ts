import { Model, DataTypes } from 'sequelize'
import sequelize = require("./db");
class Message extends Model {
    declare uid: string
    declare content: string
    declare id: string
    declare createdAt: Date
}
Message.init({
    uid: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    freezeTableName: true
})

export = Message