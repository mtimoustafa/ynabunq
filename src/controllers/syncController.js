const { getRedisClient } = require('../helpers/redisHelper.js')
const BunqService = require('../services/bunqService.js')
const YnabService = require('../services/ynabService.js')
const BunqYnabAdapter = require('../adapters/bunqYnabAdapter.js')

const bunqService = new BunqService()
const ynabService = new YnabService()

module.exports = {
  syncTransactions: async ({ syncDate }) => {
    const { status, data } = await bunqService.fetchTransactions({ syncDate })
    if (status !== 200) return { status, data }

    const ynabTransactions = data.transactions.map(transaction => BunqYnabAdapter.formatBunqTransactionToYnab(transaction))
    console.info('Syncing:', ynabTransactions)

    if (process.env.NODE_ENV === 'development') return { status: 200, data: null }

    let message = ''
    if (data.transactions.length > 0) {
      await ynabService.postTransactions(ynabTransactions)

      const syncDate = data.transactions[0].created

      const redisClient = await getRedisClient()
      await redisClient.set('syncDate', syncDate)

      message = `Sync completed. Last synced transaction date: ${syncDate}`
    } else {
      message = 'Budget already up-to-date.'
    }

    console.log(message)
    return { status: 200, data: { message } }
  }
}
