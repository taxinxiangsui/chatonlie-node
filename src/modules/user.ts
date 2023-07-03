import { Model, DataTypes } from 'sequelize'
import sequelize = require("./db");
class User extends Model {
    declare uid: string
    declare username: string
    declare password: string
    declare name: string
    declare avatar: string
}
User.init({
    uid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    freezeTableName: true
})

export = User