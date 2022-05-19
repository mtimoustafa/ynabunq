const app = require('express')()
const syncController = require('../controllers/syncController.js')

app.get('/', (request, response) => {
  response.status(200).send({ message: 'Its a me YNABunq!' })
})

app.get('/sync', async (request, response) => {
  try {
    const { status, data } = await syncController.syncTransactions()

    if (status === 200) response.status(status).send(data)
    else response.sendStatus(status)
  } catch (error) {
    console.error(error)
    response.status(500).send({ error: 'Failed to sync data' })
  }
})

app.listen(process.env.PORT, () => {
  console.info(`Listening on http://localhost:${process.env.PORT}`)
  if (process.env.NODE_ENV !== 'production') console.warn('Running in non-production mode!')
})
