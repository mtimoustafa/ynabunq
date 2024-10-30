import dotenv from 'dotenv'
import router from './router.js'

dotenv.config()

const port = process.env.port || 3000

const server = router.listen(port, () => {
  console.info(`Running in ${process.env.NODE_ENV} mode. Listening on port ${port}.`)
})
