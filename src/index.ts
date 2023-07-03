import initDB = require('./modules/index')



initDB().then(() => {
    require('./router/init')
})