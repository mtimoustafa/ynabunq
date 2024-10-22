import dotenv from 'dotenv'
import express from 'express'

import { syncTransactions } from './controllers/syncController.js'
import redisHelper from './helpers/redisHelper.js'
import store from './store/store.js'

dotenv.config()

const app = express()

app.get('/', (request, response) => {
  return response.status(200).send({ message: 'Its a me YNABunq!', lastSyncDate: store.syncDate })
})

// TODO: remove rest of Redis gear
// TODO; get/set syncData from new store instead of Redis
app.get('/sync', async (request, response) => {
  try {
    let syncDate = await store.get('syncDate')

    if (request.query.sync_date) {
      if (syncDate) {
        return response.status(400).send({ error: `Sync date already set to ${syncDate}` })
      }

      const dateRegex = new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
      syncDate = dateRegex.test(request.query.sync_date) ? new Date(request.query.sync_date) : null
      // await store.set('syncDate', syncDate) // TODO: would not be needed if syncTransactions updates syncDate
    } else if (syncDate == null) {
      return response.status(400).send({
        error: 'Sync date not initialized. Please set a starting sync date to sync from (inclusive). Format: YYYY-MM-DD'
      })
    }

    // return response.status(200).send({ syncDate }) // TODO: debug

    // TODO: test that transactions sync correctly with new sync date
    const { status, data } = await syncTransactions({ syncDate })

    if (status === 200) return response.status(status).send(data)
    else return response.sendStatus(status)
  } catch (error) {
    console.error(error)
    return response.status(500).send({ error: 'Failed to sync data' })
  }
})

const port = process.env.port || 3000
const server = app.listen(port, () => {
  console.info(`Listening on http://localhost:${port}`)
  if (process.env.NODE_ENV !== 'production') console.warn(`Running in ${process.env.NODE_ENV} mode!`)
})
