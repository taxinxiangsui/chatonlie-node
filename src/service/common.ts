export async function asyncHandler<T>(callBack: () => Promise<T>) {
    try {
        return await callBack()
    } catch (error: any) {
        if (error instanceof Error) {
            error = error.message
        } else if (error.errors) {
            error.errors = error.errors.map((err: any) => ({
                message: err.message
            }))
        }
        return Promise.reject(error)
    }
}