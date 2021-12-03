module.exports = class BunqService {
  #axiosHelper
  #accounts
  #transactions
  #user

  static TRANSACTION_TYPES = {
    default: ['BUNQ', 'EBA_SCT', 'IDEAL', 'MASTERCARD'],
    detailed: [ 'INTEREST', 'SAVINGS' ]
  }

  constructor() {
    this.axiosHelper = new (require('../helpers/axiosHelper.js'))({
      axiosOptions: {
        baseURL: process.env.BUNQ_API_PATH,
        headers: {
          'X-Bunq-Client-Authentication': process.env.BUNQ_API_TOKEN,
        },
      }
    })
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

    const path = `/v1/user/${this.user.id}/monetary-account/${this.accounts[accountName].id}/payment`
    const { data: { Response: response } } = await this.axiosHelper.get(path)
    return this.transactions = response
      .map(paymentWrapper => paymentWrapper.Payment)
      .sort((p1, p2) => Date.parse(p1.updated) <= Date.parse(p2.updated) ? 1 : -1)
  }

  async getFilteredTransactions({ accountName, transactionExclude = null }) {
    let transactions = await this.getTransactions({ accountName })
    if (transactionExclude) transactions = transactions.filter(t => !transactionExclude.includes(t.type))
    return transactions
  }
}
