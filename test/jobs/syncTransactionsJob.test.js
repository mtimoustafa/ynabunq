import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { schedule } from 'node-cron'
import { scheduleSyncTransactionsJob, runSyncTransactionsJob } from '../../src/jobs/syncTransactionsJob.js'
import { syncTransactions } from '../../src/controllers/syncController.js'

const mockSyncTransactionsStatus = 200
const mockSyncTransactionsData = {
  // TODO: these mock transactions repeat. Pull them into a helper.
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
}

vi.mock('node-cron', { spy: true })

vi.mock('../../src/controllers/syncController.js', () => ({
  syncTransactions: vi.fn(async () => {
    return {
      status: mockSyncTransactionsStatus,
      data: mockSyncTransactionsData,
    }
  })
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('syncTransactionsJob', () => {
  test('schedules sync job to run at the correct time', () => {
    scheduleSyncTransactionsJob()

    expect(schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function))
  })

  test('runs syncTransactions controller method', async () => {
    await runSyncTransactionsJob()

    expect(syncTransactions).toHaveBeenCalled()
  })

  describe('logging', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log')
    })

    test('logs start and end of job', async () => {
      await runSyncTransactionsJob()

      expect(console.log).toHaveBeenCalledWith("syncTransactionsJob:", expect.objectContaining({
        timestamp: expect.any(String),
        status: "started",
      }))
    })

    test('logs end of job', async() => {
      await runSyncTransactionsJob()

      expect(console.log).toHaveBeenNthCalledWith(2, "syncTransactionsJob:", expect.objectContaining({
        timestamp: expect.any(String),
        status: "completed",
        httpStatus: mockSyncTransactionsStatus,
        data: mockSyncTransactionsData,
      }))
    })
  })
})
