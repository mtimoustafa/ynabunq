const storeHelper = require('../helpers/storeHelper.js')
const AxiosHelper = require('../helpers/axiosHelper.js')

module.exports = class BunqService {
  #accounts
  #axiosHelper
  #transactions
  #user

  constructor() {
    this.getAuthToken().then((authToken) => {
      this.axiosHelper = new AxiosHelper({
        axiosOptions: {
          baseURL: process.env.BUNQ_API_PATH,
          headers: {
            'X-Bunq-Client-Authentication': authToken,
          },
        }
      })
    })
  }

  async getAuthToken() {
    const requestBody = { secret: process.env.BUNQ_API_TOKEN }
    const axiosHelper = new AxiosHelper({
      axiosOptions: {
        baseURL: process.env.BUNQ_API_PATH,
        headers: {
          'X-Bunq-Client-Authentication': process.env.BUNQ_INSTALLATION_TOKEN,
        },
      }
    })

    const { data: { Response: response } } = await axiosHelper.post('/v1/session-server', requestBody)
    return response[1].Token.token
  }

  async getUser() {
    if (this.user) return this.user

    const { data: { Response: response } } = await this.axiosHelper.get('/v1/user')
    return this.user = response[0].UserPerson
  }

  async getAccounts() {
    if (this.accounts) return this.accounts
    if (!this.user) await this.getUser()

    const path = `/v1/user/${this.user.id}/monetary-account`
    const { data: { Response: response } } = await this.axiosHelper.get(path)
    const accounts = Object.assign({}, ...response)

    return this.accounts = {
      chequing: accounts.MonetaryAccountBank,
      savings: accounts.MonetaryAccountSavings,
      jointChequing: accounts.MonetaryAccountJoint,
    }
  }

  async getTransactions({ accountName }) {
    if (this.transactions) return this.transactions
    if (!this.accounts) await this.getAccounts()

    // const accountId = this.accounts[accountName].id // Joint Chequing account is duplicated, hard code for now
    const accountId = process.env.BUNQ_ACCOUNT_ID

    const path = `/v1/user/${this.user.id}/monetary-account/${accountId}/payment`
    const { data: { Response: response } } = await this.axiosHelper.get(path, { params: { count: 200 } })

    this.transactions = response
      .map(paymentWrapper => paymentWrapper.Payment)
      .sort((p1, p2) => Date.parse(p1.created) <= Date.parse(p2.created) ? 1 : -1)

    this.transactions.forEach((transaction, index, transactions) => {
      transactions[index].amount.value = parseFloat(transaction.amount.value)
    })
    return this.transactions
  }

  async getFilteredTransactions({ accountName }) {
    let transactions = await this.getTransactions({ accountName })

    const sinceDate = storeHelper.getValue('lastSyncedTransactionDate')
    if (sinceDate) transactions = transactions.filter(t => Date.parse(t.created) > Date.parse(sinceDate))

    return this.#consolidateSavingsEntries(transactions)
  }

  #consolidateSavingsEntries(transactions) {
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
