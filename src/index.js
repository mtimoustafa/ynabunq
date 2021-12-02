require('dotenv').config()

const BunqService = require('./services/bunqService.js')
const YnabService = require('./services/ynabService.js')
const BunqYnabAdapter = require('./adapters/bunqYnabAdapter.js')

const bunqService = new BunqService()
const ynabService = new YnabService()

async function syncLatestTransaction() {
  const transactions = await bunqService.getFilteredTransactions({
    accountName: 'chequing',
    transactionTypes: BunqService.TRANSACTION_TYPES.default,
  })
  const transaction = transactions.filter(t => t.type !== 'SAVINGS')[0]

  transactions.forEach(transaction => {
    ynabService.postTransaction(BunqYnabAdapter.formatBunqTransactionToYnab(transaction))
  })
}

syncLatestTransaction()
