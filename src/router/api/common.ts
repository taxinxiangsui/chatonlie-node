import { type Response, Request, NextFunction } from 'express'
import resMsg from '../resMsg'
export function asyncHandler(callBack: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await callBack(req, res, next)
            res.send({
                ...resMsg.success,
                data: result
            })
        } catch (error) {
            if (error instanceof Error) {
                res.send(JSON.parse(error.message))
            } else {
                res.send({
                    ...resMsg.error,
                    data: error
                })
            }
        }
    }
}