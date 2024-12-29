const randomizeString = len => {
    const charCollection = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let out = ''
    let it = 0

    while (it < len) {
        out += charCollection.charAt(Math.floor(Math.random() * charCollection.length))
        it += 1
    }

    return out
}

module.exports = { randomizeString }