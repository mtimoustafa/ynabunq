module.exports = class AxiosHelper {
  #axios

  constructor({ axiosOptions }) {
    this.axios = require('axios').default.create(axiosOptions)
  }

  async call(axiosCall) {
    try {
      return await axiosCall()
    } catch (error) {
      if (!error.response) throw error
      console.error(error.response.status, error.response.data)
    }
  }

  async get(path, options = {}) {
    return await this.call(() => this.axios.get(path, options))
  }

  async post(path, options = {}) {
    return await this.call(() => this.axios.post(path, options))
  }
}
