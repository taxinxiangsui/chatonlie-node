import express = require('express')
import fs from 'fs'
import path from 'path'
import { type Response, Request } from 'express'
import userService = require('../../service/user-service')
import { type WebSocket } from 'ws'
import { socketMsg } from '../types'
import { asyncHandler } from './common'
const router = express.Router()
function useRouter(chatUserMap: Map<string, WebSocket>) {
    router.post('/login', asyncHandler(async (req: Request, res: Response) => {
        const body = req.body
        if (!body) {
            return Promise.reject('illegal params')
        } else if (!body.username) {
            return Promise.reject('no required param username')
        } else if (!body.password) {
            return Promise.reject('no required param password')
        }
        let uid: any
        uid = await userService.checkUserInfo(body.username, body.password)
        if (!uid) {
            uid = await userService.createUser(body.username, body.password)
        }
        res.cookie('uid', uid, {
            expires: new Date(Date.now() + 3600000 * 24 * 2),
            path: '/'
        })
        res.header('uid', uid + ';' + Date.now())
    }))
    router.get('/getUserInfo', asyncHandler(async (req: Request, res: Response) => {
        return {
            username: res.locals.userInfo?.username,
            name: res.locals.userInfo?.name,
            avatar: res.locals.userInfo?.avatar,
        }
    }))
    router.post('/update', asyncHandler(async (req: Request, res: Response) => {
        const body = req.body
        await checkField(body)
        const [affectedCount] = await userService.updateInfo(body, res.locals.userInfo?.uid)
        if (res.locals.userInfo?.avatar) {
            const fileName = /avatar\/(.*\.(?:png|jpg|jpeg))$/.exec(res.locals.userInfo.avatar)?.[1]
            fs.unlink(path.resolve(__dirname, `../../../public/upload/avatar/${fileName}`), () => { })
        }
        if (affectedCount > 0) {
            chatUserMap.forEach((ws, uid) => {
                if (uid !== res.locals.userInfo?.uid) {
                    ws.send(JSON.stringify({
                        type: socketMsg.update,
                        username: res.locals.userInfo?.username,
                        data: body
                    }))
                }
            })
        }
        return {
            affectedCount
        }
        function illegalField(reqBody: any) {
            return reqBody.uid || reqBody.username || reqBody.password || reqBody.createdAt || reqBody.updatedAt
        }
        function checkField(reqBody: any) {
            if (!reqBody) {
                return Promise.reject('无有效字段')
            } else if (illegalField(reqBody)) {
                return Promise.reject('存在不可修改字段')
            } else {
                if (reqBody.name?.toString().length > 10) {
                    return Promise.reject('昵称长度不能超过10位')
                }
                return Promise.resolve()
            }
        }
    }))

    return router
}

export = useRouter
