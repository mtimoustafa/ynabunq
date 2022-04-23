const storeHelper = require('../helpers/storeHelper.js')

const BunqService = require('../services/bunqService.js')
const YnabService = require('../services/ynabService.js')
const BunqYnabAdapter = require('../adapters/bunqYnabAdapter.js')

const bunqService = new BunqService()
const ynabService = new YnabService()

module.exports = {
  syncTransactions: async () => {
    storeHelper.createStoreIfNotExists()

    const transactions = await bunqService.getFilteredTransactions({
      accountName: 'jointChequing',
      transactionExclude: BunqService.TRANSACTION_TYPES.detailed,
    })

    console.log('Syncing:', transactions.map(transaction => BunqYnabAdapter.formatBunqTransactionToYnab(transaction)))

    if (transactions.length > 0) {
      await ynabService.postTransactions(transactions.map(transaction => BunqYnabAdapter.formatBunqTransactionToYnab(transaction)))
      storeHelper.setValue('lastSyncedTransactionDate', transactions[0].updated)
    }
  }
}
