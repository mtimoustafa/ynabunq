import dotenv from 'dotenv'
import express from 'express'

import { syncTransactions } from './controllers/syncController.js'
import store from './store/store.js'

dotenv.config()

const app = express()

app.get('/', async (request, response) => {
  return response.status(200).send({
    message: 'Its a me YNABunq!',
    lastSyncDate: await store.get('syncDate')
  })
})

app.get('/sync', async (request, response) => {
  try {
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

const port = process.env.port || 3000
const server = app.listen(port, () => {
  console.info(`Listening on http://localhost:${port}`)
  if (process.env.NODE_ENV !== 'production') console.warn(`Running in ${process.env.NODE_ENV} mode!`)
})
