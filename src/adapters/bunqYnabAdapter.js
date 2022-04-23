const toYnabDate = date => {
  formattedDate = new Date(date.replace(' ', 'T') + 'Z') // Date string to ISO format
  dateString = new Intl.DateTimeFormat('nl', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(formattedDate)
  return dateString.split('-').reverse().join('-') // Change DD-MM-YYYY to YYYY-MM-DD (yes I hate this too)
}

module.exports = {
  formatBunqTransactionToYnab(bunqTransaction) {
    return {
      payee_name: bunqTransaction.counterparty_alias.display_name,
      amount: bunqTransaction.amount.value.toFixed(2) * 1000,
      date: toYnabDate(bunqTransaction.created),
      memo: bunqTransaction.description,
    }
  }
}
