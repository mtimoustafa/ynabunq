import { v4 as uuidv4 } from 'uuid'
import AxiosHelper from '../helpers/axiosHelper.js'
import { formattedLocalDate } from '../helpers/dateHelper.js'

export default class YnabService {
  #axiosHelper

  constructor() {
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
    return response
  }

  async postTransactions(transactions) {
    const transactionsWithAccountId = transactions.map(transaction => {
      return {
        account_id: process.env.YNAB_ACCOUNT_ID,
        cleared: 'cleared',
        import_id: this.generateImportId(),
        ...transaction
      }
    })

    const path = `/budgets/${process.env.YNAB_BUDGET_ID}/transactions`
    return await this.axiosHelper.post(path, {
      transactions: transactionsWithAccountId,
    })
  }

  generateImportId() {
    const dateToday = formattedLocalDate(new Date())
    const importId = `ynabunq_${dateToday}_${uuidv4()}`

    return importId.substring(0, 36) // YNAB's import_id maximum length is 36 characters
  }
}
