const axios = require('axios').default.create({
  baseURL: process.env.YNAB_API_PATH,
  headers: {
    'Authorization': `Bearer ${process.env.YNAB_API_TOKEN}`,
  },
})

module.exports = class YnabService {
  constructor() {
  }

  async getTransaction() {
    try {
      const { data: { data: response } } = await axios.get('/v1/budgets')

      const budgets = response
      console.log(budgets)
    } catch (error) {
      console.log(error.response.status, error.response.data)
    }
  }
}
