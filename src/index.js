require('dotenv').config()

const app = require('express')()
const syncController = require('./controllers/syncController.js')
const { createClient } = require('redis')

let redisClient

app.get('/', (request, response) => {
  return response.status(200).send({ message: 'Its a me YNABunq!' })
})

app.get('/sync', async (request, response) => {
  try {
    const { status, data } = await syncController.syncTransactions()

    if (status === 200) return response.status(status).send(data)
    else return response.sendStatus(status)
  } catch (error) {
    console.error(error)
    return response.status(500).send({ error: 'Failed to sync data' })
  }
})

app.get('/redis', async (request, response) => {
  try {
    await redisClient.set('test', 'hi')
    const value = await redisClient.get('test')
    return response.status(200).send({ value })
  } catch (error) {
    console.error(error)
    return response.sendStatus(500)
  }
})

async function initRedis() {
  redisClient = createClient({
    socket: {
      connectTimeout: 10 * 1000,
      port: 6379,
    },
  })

  redisClient.on('connect', () => console.info('[REDIS] Connecting...'))
  redisClient.on('ready', () => console.info('[REDIS] Connected!'))
  redisClient.on('error', err => console.error('[REDIS]', err.message))
  redisClient.on('reconnecting', () => console.info('[REDIS] Reconnecting...'))
  redisClient.on('end', () => console.info('[REDIS] Disconnected.'))

  await redisClient.connect()
}

initRedis().then(() => {
  const server = app.listen(process.env.PORT, () => {
    console.info(`Listening on http://localhost:${process.env.PORT}`)
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
