require('dotenv').config()

const BunqService = require('./services/bunqService.js')
const YnabService = require('./services/ynabService.js')
const BunqYnabAdapter = require('./adapters/bunqYnabAdapter.js')

const bunqService = new BunqService()
const ynabService = new YnabService()
const fs = require('fs')

async function syncTransactions() {
  const transactions = await bunqService.getFilteredTransactions({
    accountName: 'chequing',
    transactionExclude: BunqService.TRANSACTION_TYPES.detailed,
  })

  transactions.forEach(transaction => {
    ynabService.postTransaction(BunqYnabAdapter.formatBunqTransactionToYnab(transaction))
  })

  fs.access('db/state.json', fs.constants.F_OK, (error) => {
    if (error) {
      fs.mkdir('./db', error => {})
      fs.writeFile('./db/state.json', '{}', error => {
        if (error) console.error(error)
      })
    }
  })

  const state = JSON.parse(fs.readFileSync('./db/state.json'))
  state.lastSyncedTransactionDate = transactions[0].updated

  fs.writeFile('./db/state.json', JSON.stringify(state, null, 2), error => {
    if (error) console.error(error)
  })
}

syncTransactions()
