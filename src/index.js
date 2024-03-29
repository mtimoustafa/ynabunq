import dotenv from 'dotenv'
import express from 'express'

import { syncTransactions } from './controllers/syncController.js'
import redisHelper from './helpers/redisHelper.js'

dotenv.config()

const app = express()

app.get('/', (request, response) => {
  return response.status(200).send({ message: 'Its a me YNABunq!' })
})

app.get('/sync', async (request, response) => {
  try {
    const dateRegex = new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
    const syncDate = dateRegex.test(request.query.sync_date) ? new Date(request.query.sync_date) : null

    const { status, data } = await syncTransactions({ syncDate })

    if (status === 200) return response.status(status).send(data)
    else return response.sendStatus(status)
  } catch (error) {
    console.error(error)
    return response.status(500).send({ error: 'Failed to sync data' })
  }
})

redisHelper.getRedisClient().then(redisClient => {
  const port = process.env.port || 3000
  const server = app.listen(port, () => {
    console.info(`Listening on http://localhost:${port}`)
    if (process.env.NODE_ENV !== 'production') console.warn(`Running in ${process.env.NODE_ENV} mode!`)
  })

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  function shutdown() {
    redisClient.quit()
      .catch(error => console.error('[REDIS] Error disconnecting:', error))
      .finally(() => {
        server.close(() => process.exit(0))
      })
  }
})
