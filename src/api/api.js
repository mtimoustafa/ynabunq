const app = require('express')()
const syncController = require('../controllers/syncController.js')

app.get('/', (request, response) => {
  response.status(200).send('Hihi!')
})

app.post('/sync', async (request, response) => {
  try {
    await syncController.syncTransactions()
    response.sendStatus(200)
  } catch (error) {
    console.error(error)
    response.status(500)
  }
})

app.listen(process.env.PORT, () => {
  console.info(`Listening on http://localhost:${process.env.PORT}`)
  if (process.env.NODE_ENV !== 'production') console.warn('Running in non-production mode!')
})
