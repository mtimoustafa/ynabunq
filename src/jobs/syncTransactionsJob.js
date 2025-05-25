import { schedule } from 'node-cron'
import store from '../store/store.js'
import { syncTransactions } from '../controllers/syncController.js'

function scheduleSyncTransactionsJob() {
  // Run once an hour, at the beginning of the hour
  schedule('0 * * * *', async () => {
    runSyncTransactionsJob()
  })
}

async function runSyncTransactionsJob() {
  console.log('Sync Job:', {
    timestamp: new Date(Date.now()).toISOString(),
    status: 'started',
  })

  // TODO: syncDate concern should move into syncTransactions
  const syncDate = await store.get('syncDate')

  const { status, data } = await syncTransactions({ syncDate })

  console.log('Sync Job:', {
    timestamp: new Date(Date.now()).toISOString(),
    status: 'completed',
    httpStatus: status,
    data,
  })
}

export { scheduleSyncTransactionsJob, runSyncTransactionsJob }
