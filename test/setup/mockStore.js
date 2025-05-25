import { vi } from 'vitest'

vi.mock('../../src/store/store.js', () => {
  const store = vi.fn()

  store.get = vi.fn(async () => {
    return { syncDate: new Date(Date.now()).toISOString() }
  })
  store.set = vi.fn()

  return { default: store }
})
