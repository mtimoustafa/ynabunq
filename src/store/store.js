import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export default class Store {
  static async get(property) {
    console.log('hi')
    const store = await this.#getStore()
    return store[property]
  }

  static async set(property, value) {
    let store = await this.#getStore()
    store[property] = value
    await writeFile(this.#storePath(), JSON.stringify(store))
  }

  static #storePath() {
    // TODO: try resolve('./store.json')
    return resolve(import.meta.dirname, 'store.json')
  }

  static async #createStore() {
    // console.log('Creating store: ', this.#storePath)
    await writeFile(this.#storePath(), JSON.stringify({}))
  }

  static async #getStore() {
    if (!existsSync(this.#storePath())) { await this.#createStore() }

    return JSON.parse(await readFile(this.#storePath()))
  }
}
