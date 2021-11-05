require('dotenv').config()

const axios = require('axios').default

const getBudgets = async function() {
  const { status, data: response } = await axios.get('/v1/budgets', {
    baseURL: process.env.YNAB_API_PATH,
    headers: {
      'Authorization': `Bearer ${process.env.YNAB_API_TOKEN}`
    }
  }).catch(error => error.response)

  console.log(status, response)
}

getBudgets()
