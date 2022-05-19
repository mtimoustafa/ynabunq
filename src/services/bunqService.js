const StoreHelper = require('../helpers/storeHelper.js')
const AxiosHelper = require('../helpers/axiosHelper.js')

module.exports = class BunqService {
  #axiosHelper
  #user

  async fetchTransactions() {
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
        transactions: this.#formatTransactions({ transactions: data.transactions })
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

  #formatTransactions({ transactions }) {
    const sinceDate = StoreHelper.getValue('lastSyncedTransactionDate')

    if (sinceDate) {
      transactions = transactions.filter(t => Date.parse(t.created) > Date.parse(sinceDate))
    }

    return this.#consolidateSavingsEntries({ transactions })
  }

  #consolidateSavingsEntries({ transactions }) {
    let newTransactions = []

    transactions.forEach((transaction, index) => {
      if (transaction.type === 'SAVINGS') {
        let mainTransaction = transactions[index + 1]
        mainTransaction.amount.value += transaction.amount.value
      } else {
        newTransactions.push(transaction)
      }
    })

    return newTransactions
  }
}
