const fs = require('fs')

const BunqService = require('../services/bunqService.js')
const YnabService = require('../services/ynabService.js')
const BunqYnabAdapter = require('../adapters/bunqYnabAdapter.js')

const bunqService = new BunqService()
const ynabService = new YnabService()

module.exports = {
  syncTransactions: async () => {
    const transactions = await bunqService.getFilteredTransactions({
      accountName: 'chequing',
      transactionExclude: BunqService.TRANSACTION_TYPES.detailed,
    })

    await ynabService.postTransactions(transactions.map(transaction => BunqYnabAdapter.formatBunqTransactionToYnab(transaction)))

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
}
