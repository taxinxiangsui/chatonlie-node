import sequelize from 'sequelize'
import Message = require('../modules/message')
import { asyncHandler } from './common'
async function insertMsg(uid: string, content: string) {
    return asyncHandler<Message>(async () => await Message.create({ uid, content }))
}
async function selectMsg(page: number, order: 'normal' | 'reverse' = 'reverse') {
    return asyncHandler<Message[]>(async () => await Message.findAll({
        order: order === 'reverse' ? [['createdAt', 'DESC']] : [['createdAt', 'ASC']],
        offset: (page - 1) * 30,
        limit: 30,
    }))
}
export = {
    insertMsg,
    selectMsg
}