import {Redis} from "ioredis"

const publisher = new Redis(process.env.REDIS_URL!)
const subscriber = new Redis(process.env.REDIS_URL!)




export { publisher, subscriber }