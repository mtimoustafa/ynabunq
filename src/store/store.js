import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export default class Store {
  static #storePath = resolve('./data/store.json')

  static async get(property) {
    const store = await this.#getStore()
    return store[property]
  }

  static async set(property, value) {
    let store = await this.#getStore()
    store[property] = value
    await writeFile(this.#storePath, JSON.stringify(store))
  }

  static async #createStore() {
    await writeFile(this.#storePath, JSON.stringify({}))
  }

  static async #getStore() {
    if (!existsSync(this.#storePath)) { await this.#createStore() }

    return JSON.parse(await readFile(this.#storePath))
  }
}
