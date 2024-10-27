import express from 'express'
import { syncTransactions } from './controllers/syncController.js'
import store from './store/store.js'

const router = express()

router.get('/', async (request, response) => {
  return response.status(200).send({
    message: 'Its a me YNABunq!',
    lastSyncDate: await store.get('syncDate')
  })
})

router.get('/sync', async (request, response) => {
  try {
    // TODO: encapsulate logic into syncController
    let syncDate = await store.get('syncDate')

    if (request.query.sync_date) {
      if (syncDate) {
        return response.status(400).send({ error: `Sync date already set to ${syncDate}` })
      }

      const dateRegex = new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
      syncDate = dateRegex.test(request.query.sync_date) ? new Date(request.query.sync_date) : null
    } else if (syncDate == null) {
      return response.status(400).send({
        error: 'Sync date not initialized. Please set a starting sync date to sync from (inclusive). Format: YYYY-MM-DD'
      })
    }

    const { status, data } = await syncTransactions({ syncDate })

    if (status === 200) return response.status(status).send(data)
    else return response.sendStatus(status)
  } catch (error) {
    console.error(error)
    return response.status(500).send({ error: 'Failed to sync data' })
  }
})

export default router
