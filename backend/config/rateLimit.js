const {getRedisClient} = require('./redis');


// It will act as a middleware. So express.js will pass req, res, next objects to it.
module.exports = function rateLimiter({ windowSizeInSeconds, maxRequests, action }) {
    return async function (req, res, next) {
        const key = `rate-limit:${req.ip}:${action}`; // or req.user.id for logged-in users
        const redisClient = await getRedisClient();
        const current = await redisClient.get(key);
        
        if (current) {
            if (parseInt(current) >= maxRequests) {
                return res.status(429).json({ message: "Too many requests. Try again later." });
            }

            await redisClient.incr(key);
        } else {
            // Set key for first time
            await redisClient.set(key, 1, {
                'condition': 'NX',
                'expiration': {'type': 'EX', 'value': windowSizeInSeconds}
            });
        }

        next();
    }
}
