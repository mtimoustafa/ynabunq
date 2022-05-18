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
      console.error(
        error.request.method,
        error.request.path,
        error.response.status,
        JSON.stringify(error.response.data, null, 2)
      )
    }
  }

  async get(path, options = {}) {
    return await this.call(() => this.axios.get(path, options))
  }

  async post(path, body = {}) {
    return await this.call(() => this.axios.post(path, body))
  }
}
