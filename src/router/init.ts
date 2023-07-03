import express = require('express')
import path = require('path')
import userRouter = require('./api/user')
import uploadRouter = require('./api/upload')
import socketRouter = require('./api/socket')
import resMsg from './resMsg'
import { checkIndexToken, checkApiToken } from './check-token-middleware'
import cookieParser from 'cookie-parser'
import { type WebSocket } from 'ws'
import { httpConfig } from '../config'

const staticPath = path.resolve(__dirname, '../../public')
const chatUserMap = new Map<string, WebSocket>()
const app = express()


require('express-ws')(app);
app.use(cookieParser()) //获取和设置cookie插件
app.use(checkIndexToken) //访问首页时检查cookie
app.use(express.static(staticPath)) //静态资源处理
// app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(checkApiToken) //调用api时检查cookie

app.use("/api/user", userRouter(chatUserMap))
app.use("/api/upload", uploadRouter(chatUserMap))
app.use("/socket", socketRouter(chatUserMap))

app.use([(err, req, res, next) => {
    if (err) {
        res.status(500).send({
            ...resMsg.error,
            data: err
        })
    } else {
        next()
    }
}])

const port = httpConfig.port
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)

})