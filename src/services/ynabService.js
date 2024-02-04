import AxiosHelper from '../helpers/axiosHelper.js'

export default class YnabService {
  #axiosHelper
  #transactions

  constructor(options = {}) {
    this.axiosHelper = new AxiosHelper({
      axiosOptions: {
        baseURL: process.env.YNAB_API_PATH,
        headers: {
          'Authorization': `Bearer ${process.env.YNAB_API_TOKEN}`,
        },
      }
    })
  }

  async getTransactions() {
    const path = `/budgets/${process.env.YNAB_BUDGET_ID}/transactions`
    const { data: { data: response } } = await this.axiosHelper.get(path)
    return this.transactions = response
  }

  async postTransactions(transactions) {
    const transactionsWithAccountId = transactions.map(transaction => {
      return {
        account_id: process.env.YNAB_ACCOUNT_ID,
        ...transaction
      }
    })

    const path = `/budgets/${process.env.YNAB_BUDGET_ID}/transactions`

    if (process.env.NODE_ENV !== 'production') return // Dirty hack, I know

    return await this.axiosHelper.post(path, {
      transactions: transactionsWithAccountId,
    })
  }
}
