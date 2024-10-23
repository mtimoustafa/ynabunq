import store from '../store/store.js'
import BunqService from '../services/bunqService.js'
import YnabService from '../services/ynabService.js'
import { formatBunqTransactionToYnab } from '../adapters/bunqYnabAdapter.js'

export async function syncTransactions({ syncDate }) {
  const bunqService = new BunqService()
  const ynabService = new YnabService()

  let { status, data } = await bunqService.fetchTransactions({ syncDate })
  if (status !== 200) return { status, data }

  const bunqTransactions = data.transactions
  const ynabTransactions = bunqTransactions.map(transaction => formatBunqTransactionToYnab(transaction))
  console.info('Syncing:', ynabTransactions)

  let message = ''
  if (data.transactions.length > 0) {
    ( { status, data } = await ynabService.postTransactions(ynabTransactions) )
    if (status !== 201) return { status, data }

    const newSyncDate = new Date(bunqTransactions[0].created)
    await store.set('syncDate', newSyncDate.toISOString())

    message = `Sync completed. Last synced transaction date: ${newSyncDate}`
  } else {
    message = 'Budget already up-to-date.'
  }

  console.info(message)
  return { status: 200, data: { message } }
}
