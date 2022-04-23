module.exports = class YnabService {
  defaultBudget
  #axiosHelper
  #budgets
  #transactions

  constructor(options = {}) {
    this.axiosHelper = new (require('../helpers/axiosHelper.js'))({
      axiosOptions: {
        baseURL: process.env.YNAB_API_PATH,
        headers: {
          'Authorization': `Bearer ${process.env.YNAB_API_TOKEN}`,
        },
      }
    })

    this.defaultBudget = options.defaultBudget
  }

  async getBudgets() {
    const { data: { data: { budgets: response } } } = await this.axiosHelper.get('/v1/budgets', {
      params: {
        include_accounts: 'true'
      }
    })
    return this.budgets = response
  }

  async getTransactions() {
    const path = `/v1/budgets/${process.env.YNAB_BUDGET_ID}/transactions`
    const { data: { data: response } } = await this.axiosHelper.get(path)
    return this.transactions = response
  }

  async postTransactions(transactions) {
    if (!this.budgets) await this.getBudgets()

    const transactionsWithAccountId = transactions.map(transaction => {
      return {
        account_id: process.env.YNAB_ACCOUNT_ID,
        ...transaction
      }
    })

    const path = `/v1/budgets/${process.env.YNAB_BUDGET_ID}/transactions`
    await this.axiosHelper.post(path, {
      transactions: transactionsWithAccountId,
    })
  }
}
