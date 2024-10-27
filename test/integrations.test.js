import dotenv from 'dotenv'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import router from '../src/router.js'
import store from '../src/store/store.js'
import AxiosHelper from '../src/helpers/axiosHelper.js'

dotenv.config()

vi.mock('../src/store/store.js', () => {
  const store = vi.fn()
  store.get = vi.fn()
  store.set = vi.fn()

  return { default: store }
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('returns heartbeat message', async () => {
  const response = await request(router).get('/')

  expect(response.status).toBe(200)
  expect(response.body).toEqual({ message: 'Its a me YNABunq!' })
})

describe('when sync date not set', () => {
  test('does not sync', async () => {
    const response = await request(router).get('/sync')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: 'Sync date not initialized. Please set a starting sync date to sync from (inclusive). Format: YYYY-MM-DD'
    })
  })

  test('syncs transactions when sync_date parameter is supplied', async () => {
    const axiosHelperGet = vi.spyOn(AxiosHelper.prototype, 'get')
    const axiosHelperPost = vi.spyOn(AxiosHelper.prototype, 'post')

    const response = await request(router)
      .get('/sync')
      .query({ sync_date: '2024-10-24' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: expect.stringContaining('Sync completed. Last synced transaction date:')
    })

    expect(store.get).toHaveBeenCalledTimes(1)
    expect(store.get).toHaveBeenCalledWith('syncDate')

    expect(axiosHelperGet).toHaveBeenCalledWith(
      expect.stringMatching(/\/user\/.+?\/monetary-account\/.+?\/payment/),
      expect.any(Object),
    )
    expect(axiosHelperPost).toHaveBeenCalledWith(
      expect.stringMatching(/\/budgets\/.+?\/transactions/),
      { transactions: expect.any(Object) }
    )
  })
})

describe('when sync date is set', () => {
  // TODO: globalize this in this file?
  const syncDate = '2024-10-24' // TODO: make dates dynamic (7 days before)

  beforeEach(() => {
    store.get.mockReturnValue(syncDate)
  })

  test('syncs transaction', async () => {
    const response = await request(router).get('/sync')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: expect.stringContaining('Sync completed. Last synced transaction date:')
    })
  })

  test('does not sync if sync_date parameter is supplied', async () => {
    const response = await request(router)
      .get('/sync')
      .query({ sync_date: '2024-10-24' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: `Sync date already set to ${syncDate}`,
    })
  })
})
