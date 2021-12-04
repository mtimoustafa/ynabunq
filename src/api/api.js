const app = require('express')()
const syncController = require('../controllers/syncController.js')

app.get('/', (request, response) => {
  response.sendStatus(200).send('Hihi!')
})

app.post('/sync', async (request, response) => {
  try {
    await syncController.syncTransactions()
    response.sendStatus(200)
  } catch (error) {
    response.status(500).send(error)
  }
})

app.listen(process.env.API_PORT, () => {
  console.log(`Listening on http://localhost:${process.env.API_PORT}`)
})
