const storeHelper = require('../helpers/storeHelper.js')

const BunqService = require('../services/bunqService.js')
const YnabService = require('../services/ynabService.js')
const BunqYnabAdapter = require('../adapters/bunqYnabAdapter.js')

const bunqService = new BunqService()
const ynabService = new YnabService()

module.exports = {
  syncTransactions: async () => {
    storeHelper.createStoreIfNotExists()

    const { status, data } = await bunqService.fetchTransactions()
    if (status !== 200) return { status, data }

    const ynabTransactions = data.transactions.map(transaction => BunqYnabAdapter.formatBunqTransactionToYnab(transaction))
    console.info('Syncing:', ynabTransactions)

    if (process.env.NODE_ENV === 'development') return { status: 200, data: null }

    const message = ''

    if (data.transactions.length > 0) {
      await ynabService.postTransactions(ynabTransactions)
      storeHelper.setValue('lastSyncedTransactionDate', data.transactions[0].created)

      message = `Sync completed. Last synced transaction date: ${storeHelper.getValue('lastSyncedTransactionDate')}`
    } else {
      message = 'Budget already up-to-date.'
    }

    return { status: 200, data: { message } }
  }
}
