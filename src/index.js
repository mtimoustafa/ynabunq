require('dotenv').config()

const BunqService = require('./services/bunqService.js')
const YnabService = require('./services/ynabService.js')

BunqService.getTransaction()
YnabService.getTransaction()
