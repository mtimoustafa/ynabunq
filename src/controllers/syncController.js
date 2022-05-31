import redisHelper from '../helpers/redisHelper.js'
import BunqService from '../services/bunqService.js'
import YnabService from '../services/ynabService.js'
import { formatBunqTransactionToYnab } from '../adapters/bunqYnabAdapter.js'

const bunqService = new BunqService()
const ynabService = new YnabService()

export async function syncTransactions({ syncDate }) {
  const { status, data } = await bunqService.fetchTransactions({ syncDate })
  if (status !== 200) return { status, data }

  const ynabTransactions = data.transactions.map(transaction => formatBunqTransactionToYnab(transaction))
  console.info('Syncing:', ynabTransactions)

  let message = ''
  if (data.transactions.length > 0) {
    await ynabService.postTransactions(ynabTransactions)

    const syncDate = data.transactions[0].created

    const redisClient = await redisHelper.getRedisClient()
    await redisClient.set('syncDate', syncDate)

    message = `Sync completed. Last synced transaction date: ${syncDate}`
  } else {
    message = 'Budget already up-to-date.'
  }

  console.log(message)
  return { status: 200, data: { message } }
}
