import express from 'express'
import { type WebSocket } from 'ws'
import { asyncHandler } from './common'
import multiparty from 'multiparty'
import path from 'path'
import os from 'os'
import { httpConfig } from '../../config'
const router = express.Router()
function useRouter(chatUserMap: Map<string, WebSocket>) {
    router.post("/avatar", asyncHandler(async (req, res) => {
        const form = new multiparty.Form({ uploadDir: path.resolve(__dirname, '../../../public/upload/avatar') })
        return new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err)
                } else {
                    const fileName = /avatar\\(.*\.(?:png|jpg|jpeg))$/.exec(files.avatar[0].path as string)?.[1]
                    const path = `http://${getIPAdress()}:${httpConfig.port}/upload/avatar/${fileName}`
                    resolve(path)
                }
            })
        })
    }))

    return router
}
function getIPAdress() {
    const address = os.networkInterfaces()
    for (var devName in address) {
        var iface = address[devName];
        if (iface) {
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
}
export = useRouter