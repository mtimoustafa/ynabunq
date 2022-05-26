const fs = require('fs')
const storeFile = 'store.json'
const storeDir = './store'
const storePath = `${storeDir}/${storeFile}`

const store = JSON.parse(fs.readFileSync(storePath))

const createStoreIfNotExists = () => {
  fs.access(storePath, fs.constants.F_OK, error => {
    if (error) {
      fs.mkdir(storeDir, error => { console.error('test', error) })

      fs.writeFile(storePath, '{}', error => {
        if (error) console.error(error)
      })
    }
  })
}

const getValue = (key) => store[key]

const setValue = (key, value) => {
  store[key] = value

  fs.writeFile(storePath, JSON.stringify(store, null, 2), error => {
    if (error) console.error(error)
  })
}

module.exports = {
  createStoreIfNotExists,
  getValue,
  setValue,
}
