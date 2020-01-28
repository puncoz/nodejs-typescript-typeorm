export const normalizeNumber = (num: number | string, errorMessage: string): number => {
    if (typeof num === "undefined") {
        throw new Error(`${errorMessage} -- ${num}`)
    }

    if (typeof num === "number") {
        return num
    }

    let ret = parseInt(num)
    if (isNaN(ret)) {
        throw new Error(`${errorMessage} ${ret} -- ${num}`)
    }

    return ret
}
