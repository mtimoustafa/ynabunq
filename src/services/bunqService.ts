const axios = require('axios').default.create({
  baseURL: process.env.BUNQ_API_PATH,
  headers: {
    'Authorization': `Bearer ${process.env.BUNQ_API_TOKEN}`
  }
})

export default {
  getTransaction: async function() {
    console.log('getTransaction')
    // const { data: response } = await axios.get('/v1/budgets')

    // const budgets: BudgetInput[] = response.data
    // console.log(budgets)
  },
}
