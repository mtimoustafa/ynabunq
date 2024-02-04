import { createClient } from 'redis'

export default class RedisHelper {
  static #client = null

  static async getRedisClient() {
    if (RedisHelper.client) return RedisHelper.client

    RedisHelper.client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10 * 1000,
        rejectUnauthorized: false,
      },
    })

    RedisHelper.client.on('connect', () => console.info('[REDIS] Connecting...'))
    RedisHelper.client.on('ready', () => console.info('[REDIS] Connected!'))
    RedisHelper.client.on('error', err => console.error('[REDIS]', err.message))
    RedisHelper.client.on('reconnecting', () => console.info('[REDIS] Reconnecting...'))
    RedisHelper.client.on('end', () => console.info('[REDIS] Disconnected.'))

    await RedisHelper.client.connect()
    return RedisHelper.client
  }
}
