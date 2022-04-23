const storeHelper = require('../helpers/storeHelper.js')

const BunqService = require('../services/bunqService.js')
const YnabService = require('../services/ynabService.js')
const BunqYnabAdapter = require('../adapters/bunqYnabAdapter.js')

const bunqService = new BunqService()
const ynabService = new YnabService()

module.exports = {
  syncTransactions: async () => {
    storeHelper.createStoreIfNotExists()

    const transactions = await bunqService.getFilteredTransactions({ accountName: 'jointChequing' })

    console.info('Syncing:', transactions.map(transaction => BunqYnabAdapter.formatBunqTransactionToYnab(transaction)))

    if (transactions.length > 0) {
      await ynabService.postTransactions(transactions.map(transaction => BunqYnabAdapter.formatBunqTransactionToYnab(transaction)))
      storeHelper.setValue('lastSyncedTransactionDate', transactions[0].created)

      console.info(`Sync completed. Last synced transaction date: ${storeHelper.getValue('lastSyncedTransactionDate')}`)
    } else {
      console.info('Budget already up-to-date.')
    }
  }
}
