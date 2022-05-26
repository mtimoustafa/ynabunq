require('dotenv').config()

const app = require('express')()
const syncController = require('./controllers/syncController.js')
const { getRedisClient } = require('./helpers/redisHelper.js')

app.get('/', (request, response) => {
  return response.status(200).send({ message: 'Its a me YNABunq!' })
})

app.get('/sync', async (request, response) => {
  try {
    const dateRegex = new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
    const syncDate = dateRegex.test(request.query.sync_date) ? new Date(request.query.sync_date) : null

    const { status, data } = await syncController.syncTransactions({ syncDate })

    if (status === 200) return response.status(status).send(data)
    else return response.sendStatus(status)
  } catch (error) {
    console.error(error)
    return response.status(500).send({ error: 'Failed to sync data' })
  }
})

getRedisClient().then(() => {
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
