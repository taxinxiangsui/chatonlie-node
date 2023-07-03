import User = require('../modules/user')
import { asyncHandler } from './common'
async function createUser(username: string, password: string) {
    return asyncHandler<string>(async () => {
        const user = await User.create({
            username,
            password,
            name: '用户' + Math.ceil(Math.random() * 100000).toString()
        })
        return user.uid
    })
}
async function selectUserByPk(token: string) {
    return asyncHandler<User | null>(async () => await User.findByPk(token))
}
async function checkUserInfo(username: string, password: string) {
    return asyncHandler<string | null>(async () => {
        const user = await User.findOne({ where: { username } })
        if (!user) return null
        if (user.password !== password) {
            throw new Error('密码不正确')
        }
        return user.uid
    })
}
async function updateInfo(data: RevisableInfo, uid: string) {
    return asyncHandler<[affectedCount: number]>(async () => {
        return await User.update(data, {
            where: {
                uid: uid
            }
        })
    })
}
interface RevisableInfo {
    name?: string,
    avatar?: string,
}
export = {
    createUser,
    selectUserByPk,
    checkUserInfo,
    updateInfo
}