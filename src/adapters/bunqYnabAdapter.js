module.exports = {
  formatBunqTransactionToYnab(bunqTransaction) {
    return {
      payee_name: bunqTransaction.counterparty_alias.display_name,
      amount: parseFloat(bunqTransaction.amount.value) * 1000,
      date: bunqTransaction.updated.split(' ')[0],
      memo: bunqTransaction.description,
    }
  }
}
