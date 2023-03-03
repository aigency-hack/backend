export const redisConfig = () => ({
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379,
        auth: process.env.REDIS_AUTH,
        ttl: parseInt(process.env.REDIS_TTL) || 5,
    },
})  