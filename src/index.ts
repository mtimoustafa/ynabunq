require('dotenv').config()

const axios = require('axios').default

interface BudgetDateFormatInput {
  format: string
}
interface BudgetCurrencyFormatInput {
  iso_code: string
  example_format: string
  decimal_digits: number
  decimal_separator: string
  symbol_first: boolean
  group_separator: string
  currency_symbol: string
  display_symbol: boolean
}
interface BudgetInput {
  id: string
  name: string
  last_modified_on: Date
  first_month: Date
  last_month: Date
  date_format: BudgetDateFormatInput
  currency_format: BudgetCurrencyFormatInput
}

const getBudgets = async function() {
  const { data: response } = await axios.get('/v1/budgets', {
    baseURL: process.env.YNAB_API_PATH,
    headers: {
      'Authorization': `Bearer ${process.env.YNAB_API_TOKEN}`
    }
  })

  const budgets: BudgetInput[] = response.data
  console.log(budgets)
}

getBudgets()
