import Axios from 'axios'

export default class AxiosHelper {
  #axios

  constructor({ axiosOptions }) {
    this.axios = Axios.default.create(axiosOptions)
  }

  async call(axiosCall) {
    let response = { status: null, data: null }

    try {
      const result = await axiosCall()

      response.status = result.status
      response.data = result.data
    } catch (error) {
      if (error.response) {
        console.error(
          error.request.method,
          error.request.path,
          error.response.status,
          JSON.stringify(error.response.data, null, 2),
        )

        response.status = error.response.status
        response.data = error.response.data
      } else if (error.request) {
        console.error('Axios error in request:', error.request)
        response.status = 500
        response.data = { error: 'Error in Axios request' }
      } else {
        console.error('Axios error:', error.message)
        response.status = 500
        response.data = { error: 'Axios error' }
      }
    }

    return response
  }

  async get(path, options = {}) {
    return await this.call(() => this.axios.get(path, options))
  }

  async post(path, body = {}) {
    return await this.call(() => this.axios.post(path, body))
  }
}
