const axios = require('axios').default.create({
  baseURL: process.env.BUNQ_API_PATH,
  headers: {
    'X-Bunq-Client-Authentication': process.env.BUNQ_API_TOKEN,
  },
})

module.exports = {
  getTransaction: async function() {
    try {
      const { data: { Response: response } } = await axios.get('/v1/user')

      const budgets = response
      console.log(budgets)
    } catch (error) {
      console.log(error.response.status, error.response.data)
    }
  },
}
