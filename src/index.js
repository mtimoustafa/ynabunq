require('dotenv').config()

const BunqService = require('./services/bunqService.js')
const YnabService = require('./services/ynabService.js')

const bunqService = new BunqService()
const ynabService = new YnabService()

async function syncLatestTransaction() {
  const transactions = await bunqService.getTransactions('chequing')
  const transaction = transactions.filter(t => t.type != 'SAVINGS')[0]

  return console.log(transactions.map(t => t.type))

  ynabService.postTransaction({
    payeeName: transaction.counterparty_alias.display_name,
    amount: parseFloat(transaction.amount.value) * 1000,
    date: transaction.updated.split(' ')[0],
  })
}

syncLatestTransaction()
