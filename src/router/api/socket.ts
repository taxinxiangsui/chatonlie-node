import express = require('express')
import messageService = require('../../service/message-service')
import userService = require('../../service/user-service')
import resMsg from '../resMsg'
import Message from '../../modules/message'
import { type WebSocket } from 'ws'
import User from '../../modules/user'
import { socketMsg } from '../types'
const router = express.Router()
require('express-ws')(router)
function useSocket(chatUserMap: Map<string, WebSocket>) {
    router
        .ws('/:uid', async function (ws, req) {
            try {
                const uid = req.params.uid.substring(1)
                console.log(uid + '-----open');
                const user = uid ? await userService.selectUserByPk(uid) : null
                if (!user) {
                    ws.send(JSON.stringify({ type: socketMsg.error, data: resMsg.notLogin }))
                    ws.close()
                } else {
                    chatUserMap.set(uid, ws)
                    const msgList = await initMsg(user)
                    ws.send(JSON.stringify({ type: socketMsg.init, data: msgList }))
                    ws.on('message', function (data) {
                        const msg = JSON.parse(data.toString())
                        messageService.insertMsg(uid, msg.content).then(async (message) => {
                            const latestUser = await userService.selectUserByPk(uid)
                            sendMsg2All(latestUser as User, message)
                        })
                    })
                }
                ws.on('error', (err) => {
                    console.log('websocket error:' + err + '---------uid:' + uid);
                    chatUserMap.delete(uid)
                    ws.close()
                })
                ws.on('close', () => {
                    console.log(uid + '-----close');
                    chatUserMap.delete(uid)
                })
            } catch (error) {
                console.log('socket error --------------', error);
            }
        })
    function sendMsg2All(sender: User, message: Message) {
        function resMsgData(isSelf: boolean) {
            return {
                originalTime: message.createdAt,
                time: formatTime(message.createdAt),
                msgId: message.id,
                content: message.content,
                isSelf,
                name: sender.name,
                username: sender.username,
                avatar: sender.avatar
            }
        }
        chatUserMap.forEach((ws, uid) => {
            if (sender.uid === uid) {
                ws.send(JSON.stringify({ type: socketMsg.ok, data: resMsgData(true) }))
            } else {
                ws.send(JSON.stringify({ type: socketMsg.msg, data: resMsgData(false) }))
            }
        })
    }
    async function initMsg(user: User) {
        try {
            const msgList = await messageService.selectMsg(1)
            const uid2name = new Map<string, User>([[user.uid, user]])
            msgList.sort((a, b) => Date.parse(a.createdAt.toString()) - Date.parse(b.createdAt.toString()))
            return await msgList.reduce(async (result: Promise<resMsgList[]>, curMsg: Message) => {
                if (!uid2name.get(curMsg.uid)) {
                    const curUser = await userService.selectUserByPk(curMsg.uid)
                    if (curUser) { uid2name.set(curUser.uid, curUser) }
                }
                const msgObj = {
                    msgId: curMsg.id,
                    content: curMsg.content,
                    isSelf: curMsg.uid === user.uid,
                    name: uid2name.get(curMsg.uid)?.name,
                    username: uid2name.get(curMsg.uid)?.username,
                    avatar: uid2name.get(curMsg.uid)?.avatar
                }
                const resultList = await result
                if (resultList.length === 0) {
                    addMsg(resultList, curMsg, msgObj)
                    return result
                }
                const preMsgGroup = resultList[resultList.length - 1]
                if (Date.parse(curMsg.createdAt.toString()) - Date.parse(preMsgGroup.updateTime.toString()) <= 60 * 2 * 1000) {
                    preMsgGroup.msgList.push(msgObj)
                    preMsgGroup.updateTime = curMsg.createdAt
                } else {
                    addMsg(resultList, curMsg, msgObj)
                }
                return result
            }, Promise.resolve([]))
        } catch (error) {
            console.log(error);
            return []
        }
        function addMsg(result: resMsgList[], curMsg: Message, msgObj: any) {
            result.push({
                originalTime: curMsg.createdAt,
                updateTime: curMsg.createdAt,
                time: formatTime(curMsg.createdAt),
                msgList: [msgObj]
            })
        }
    }
    function formatTime(time: Date) {
        const timeDifference = (Date.now() - Date.parse(time.toString()))
        const yearDifference = new Date(Date.now()).getFullYear() - new Date(time.toString()).getFullYear()
        const hour = 3600 * 1000
        const options = {
            weekday: timeDifference < 7 * 24 * hour && timeDifference > 24 * hour ? 'long' : undefined,
            year: yearDifference != 0 ? 'numeric' : undefined,
            month: timeDifference > 7 * 24 * hour ? 'long' : undefined,
            day: timeDifference > 7 * 24 * hour ? 'numeric' : undefined,
            hour: 'numeric',
            minute: 'numeric',
            second: undefined
        }
        if (timeDifference < 24 * hour) {
            return new Date(time.toString()).toLocaleTimeString('zh-cn', options as any)
        } else {
            return new Date(time.toString()).toLocaleDateString('zh-cn', options as any)
        }

    }
    return router
}

interface resMsgList {
    time: string,
    originalTime: Date,
    updateTime: Date,
    msgList: {
        msgId: string,
        content: string,
        isSelf: boolean,
        name: string | undefined,
        username: string | undefined,
        avatar: string | undefined
    }[]
}

export = useSocket