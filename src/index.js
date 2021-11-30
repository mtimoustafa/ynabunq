require('dotenv').config()

const BunqService = require('./services/bunqService.js')
const YnabService = require('./services/ynabService.js')

const bunqService = new BunqService()
const ynabService = new YnabService()

bunqService.getTransaction()
ynabService.getTransaction()
