import BunqService from '../../services/bunqService.js'

import AxiosHelper from '../../helpers/axiosHelper.js'
import RedisHelper from '../../helpers/redisHelper.js'

jest.mock('../../helpers/axiosHelper.js')
jest.mock('../../helpers/redisHelper.js')

beforeEach(() => {
  AxiosHelper.mockClear()
  RedisHelper.mockClear()
})

test('passes', () => {
  jest.spyOn(AxiosHelper.prototype, 'post').mockResolvedValue({
    status: 200,
    data: { Response: [{}, { Token: { token: '1234' }}] },
  })
  jest.spyOn(AxiosHelper.prototype, 'get').mockImplementation(path => {
    if (path === '/v1/user') {
      return {
        status: 200,
        data: { Response: [{ UserPerson: { id: 'aaaa' } }] },
      }
    }
    
    return {
      status: 200,
      data: {
        Response: [
          { Payment: { amount: { value: '10.00' }, created: '2020-01-01' } },
        ],
      },
    }
  })
  RedisHelper.getRedisClient.mockResolvedValue({ get: () => null })

  const bunqService = new BunqService()
  bunqService.fetchTransactions({ syncDate: new Date('2020-01-01') })
})
