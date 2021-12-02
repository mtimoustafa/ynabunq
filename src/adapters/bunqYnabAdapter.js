module.exports = {
  formatBunqTransactionToYnab(bunqTransaction) {
    return {
      payeeName: bunqTransaction.counterparty_alias.display_name,
      amount: parseFloat(bunqTransaction.amount.value) * 1000,
      date: bunqTransaction.updated.split(' ')[0],
    }
  }
}
