import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const STORE_PATH = resolve(import.meta.dirname, 'store.json') // TODO: try resolve('./store.json')

export default class Store {
  static async #createStore() {
    // console.log('Creating store: ', STORE_PATH)
    await writeFile(STORE_PATH, JSON.stringify({}))
  }

  static async #getStore() {
    if (!existsSync(STORE_PATH)) { await this.#createStore() }

    return JSON.parse(await readFile(STORE_PATH))
  }

  static async get(property) {
    const store = await this.#getStore()
    return store[property]
  }

  static async set(property, value) {
    let store = await this.#getStore()
    store[property] = value
    await writeFile(STORE_PATH, JSON.stringify(store))
  }
}
