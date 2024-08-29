import { Redis } from "ioredis";
import config from "./config";

const redis = new Redis({
    host: config.redisUrl,
    password: config.redisPassword,
    port: parseInt(config.redisPort),
    maxRetriesPerRequest: null
})

export default redis