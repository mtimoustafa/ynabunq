const { getRedisClient } = require('../helpers/redisHelper.js')
const AxiosHelper = require('../helpers/axiosHelper.js')

module.exports = class BunqService {
  #axiosHelper
  #user

  async fetchTransactions({ syncDate }) {
    let { status, data } = await this.#getAuthToken()
    if (status !== 200) return { status, data }

    this.axiosHelper = new AxiosHelper({
      axiosOptions: {
        baseURL: process.env.BUNQ_API_PATH,
        headers: {
          'X-Bunq-Client-Authentication': data.authToken,
        },
      }
    })

    if (!this.user) {
      ( { status, data } = await this.#getUser() )
      if (status !== 200) return { status, data }

      this.user = data.user
    }

    ( { status, data } = await this.#getTransactions({ userId: this.user.id }) )
    if (status !== 200) return { status, data }

    return {
      status,
      data: {
        transactions: await this.#formatTransactions({ transactions: data.transactions, syncDate })
      }
    }
  }

  async #getAuthToken() {
    const axiosHelper = new AxiosHelper({
      axiosOptions: {
        baseURL: process.env.BUNQ_API_PATH,
        headers: {
          'X-Bunq-Client-Authentication': process.env.BUNQ_INSTALLATION_TOKEN,
        },
      }
    })

    let { status, data } = await axiosHelper.post(
      '/v1/session-server',
      { secret: process.env.BUNQ_API_TOKEN }
    )

    if (status === 200) {
      data = { authToken: data.Response[1].Token.token }
    }

    return { status, data }
  }

  async #getUser() {
    let { status, data } = await this.axiosHelper.get('/v1/user')

    if (status === 200) {
      data = { user: data.Response[0].UserPerson }
    }

    return { status, data }
  }

  async #getTransactions({ userId }) {
    let { status, data } = await this.axiosHelper.get(
      `/v1/user/${userId}/monetary-account/${process.env.BUNQ_ACCOUNT_ID}/payment`,
      { params: { count: 200 } },
    )

    if (status !== 200) return { status, data }

    let transactions = data.Response
      .map(paymentWrapper => paymentWrapper.Payment)
      .sort((p1, p2) => Date.parse(p1.created) <= Date.parse(p2.created) ? 1 : -1)

    transactions.forEach((transaction, index) => {
      transactions[index].amount.value = parseFloat(transaction.amount.value)
    })

    return { status, data: { transactions } }
  }

  async #formatTransactions({ transactions, syncDate }) {
    const redisClient = await getRedisClient()

    // How far back do we sync?
    // 1. Provided sync date param (YYYY-MM-DD)
    // 2. Stored sync date that tracks last sync point
    // 3. Current date
    const sinceDate = syncDate?.toISOString() ?? await redisClient.get('syncDate') ?? (new Date(Date.now())).toISOString()
    console.log(`Syncing from ${sinceDate}`)

    transactions = transactions.filter(t => Date.parse(t.created) > Date.parse(sinceDate))

    return this.#consolidateSavingsEntries({ transactions })
  }

  #consolidateSavingsEntries({ transactions }) {
    if (transactions.length === 0) return transactions

    let newTransactions = []

    transactions.forEach((transaction, index) => {
      if (transaction.type === 'SAVINGS') {
        let mainTransaction = transactions[index + 1]
        if (mainTransaction) {
          mainTransaction.amount.value += transaction.amount.value
        }
      } else {
        newTransactions.push(transaction)
      }
    })

    return newTransactions
  }
}
