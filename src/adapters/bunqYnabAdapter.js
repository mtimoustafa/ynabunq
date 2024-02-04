import { formattedLocalDate } from '../helpers/dateHelper.js'

const toYnabDate = date => {
  const formattedDate = new Date(date.replace(' ', 'T') + 'Z') // Date string to ISO format
  return formattedLocalDate(formattedDate)
}

export function formatBunqTransactionToYnab(bunqTransaction) {
  return {
    payee_name: bunqTransaction.counterparty_alias.display_name,
    amount: Math.round(bunqTransaction.amount.value.toFixed(2) * 1000),
    date: toYnabDate(bunqTransaction.created),
    memo: bunqTransaction.description,
  }
}
