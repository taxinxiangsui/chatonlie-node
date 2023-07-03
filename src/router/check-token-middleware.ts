import { type Response, Request, NextFunction } from 'express'
import userService from '../service/user-service'
import resMsg from './resMsg'
export async function checkIndexToken(req: Request, res: Response, next: NextFunction) {
    if (req.url === '/' || req.url === '/index.html') {
        const uid = req.cookies.uid
        const user = uid ? await userService.selectUserByPk(uid) : null
        if (user) {
            res.cookie('uid', uid, {
                expires: new Date(Date.now() + 3600000 * 24 * 2),
                path: '/'
            })
            res.cookie('showPage', 'showChat')
        }
        next()
    } else {
        next()
    }
}
export async function checkApiToken(req: Request, res: Response, next: NextFunction) {
    const uid = req.cookies.uid
    if (req.url == '/api/user/login' || req.url.indexOf('/socket') != -1) next()
    else {
        const user = uid ? await userService.selectUserByPk(uid) : null
        if (!user) {
            res.send(resMsg.notLogin)
        } else {
            res.locals.userInfo = user
            next()
        }
    }
}