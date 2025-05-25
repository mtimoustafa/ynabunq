import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import store from '../../src/store/store.js'
import BunqService from '../../src/services/bunqService.js'
import YnabService from '../../src/services/ynabService.js'

import { syncTransactions } from '../../src/controllers/syncController.js'

vi.mock('../../src/services/bunqService.js', () => {
  const BunqService = vi.fn()
  BunqService.prototype.fetchTransactions = vi.fn(() => {
    return {
      status: 200,
      data: {
        transactions: [
          {
            amount: {
              value: 5,
            },
            counterparty_alias: {
              display_name: 'Rick Astley',
            },
            created: '2024-07-01',
            description: 'Gas money',
          },
          {
            amount: {
              value: 7777,
            },
            counterparty_alias: {
              display_name: 'Mickey Mouse',
            },
            created: '2024-01-01',
            description: 'Unofficial Disney adventure',
          }
        ],
      },
    }
  })

  return { default: BunqService }
})

vi.mock('../../src/services/ynabService.js', () => {
  const YnabService = vi.fn()
  YnabService.prototype.postTransactions = vi.fn(() => {
    return {
      status: 201,
      data: {},
    }
  })

  return { default: YnabService }
})

let syncDate = new Date('2024-01-01').toISOString()

afterEach(() => {
  vi.restoreAllMocks()
})

describe('syncTransactions', () => {
  test('fetches transactions from sync date till now', async () => {
    await syncTransactions({ syncDate })

    expect(BunqService.mock.instances[0].fetchTransactions).toHaveBeenCalledWith({ syncDate })
  })

  test('updates YNAB with fetched transactions', async () => {
    const expectedTransactions = [
      {
        amount: 5000,
        payee_name: 'Rick Astley',
        date: '2024-07-01',
        memo: 'Gas money',
      },
      {
        amount: 7777000,
        payee_name: 'Mickey Mouse',
        date: '2024-01-01',
        memo: 'Unofficial Disney adventure',
      },
    ]

    await syncTransactions({ syncDate })

    expect(YnabService.mock.instances[0].postTransactions).toHaveBeenCalledWith(expectedTransactions)
  })

  test('updates syncDate', async () => {
    syncDate = new Date('2024-07-01').toISOString()

    await syncTransactions({ syncDate })

    expect(store.set).toHaveBeenCalledWith('syncDate', syncDate)
  })

  test('returns success response', async () => {
    const response = await syncTransactions({ syncDate })
    const newSyncDate = new Date('2024-07-01').toString()

    expect(response).toEqual({
      status: 200,
      data: {
        message: `Sync completed. Last synced transaction date: ${newSyncDate}`,
      },
    })
  })

  describe('when no new transactions found', () => {
    beforeEach(() => {
      BunqService.prototype.fetchTransactions = vi.fn(() => {
        return {
          status: 200,
          data: {
            transactions: []
          },
        }
      })
    })

    test('does not update YNAB', async () => {
      await syncTransactions({ syncDate })

      expect(YnabService.mock.instances[0].postTransactions).not.toHaveBeenCalled()
    })

    test('does not update syncDate', async () => {
      await syncTransactions({ syncDate })

      expect(store.set).not.toHaveBeenCalled()
    })

    test('returns success response', async () => {
      const response = await syncTransactions({ syncDate })

      expect(response).toEqual({
        status: 200,
        data: {
          message: 'Budget already up-to-date.',
        },
      })
    })
  })

  describe('when transactions fetch fails', () => {
    beforeEach(() => {
      BunqService.prototype.fetchTransactions = vi.fn(() => {
        return {
          status: 500,
          data: {
            Error: [{
              error_description: 'Server error',
            }],
          },
        }
      })
    })

    test('returns error status and data from failure', async () => {
      const response = await syncTransactions({ syncDate })

      expect(response).toEqual({
        status: 500,
        data: {},
      })
    })

    test('does not update syncDate', async () => {
      await syncTransactions({ syncDate })

      expect(store.set).not.toHaveBeenCalled()
    })
  })

  describe('when YNAB update fails', async () => {
    beforeEach(() => {
      BunqService.prototype.postTransactions = vi.fn(() => {
        return {
          status: 500,
          data: {
            error: {
              name: 'Server error'
            },
          },
        }
      })
    })

    test('returns error status and data from failure', async () => {
      const response = await syncTransactions({ syncDate })

      expect(response).toEqual({
        status: 500,
        data: {},
      })
    })

    test('does not update syncDate', async () => {
      await syncTransactions({ syncDate })

      expect(store.set).not.toHaveBeenCalled()
    })
  })
})
