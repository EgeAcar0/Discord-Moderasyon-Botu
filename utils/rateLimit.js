// Rate limiting utilities

const rateLimitMap = new Map();

function checkRateLimit(userId, commandName, limit = 5, windowMs = 60000) {
    const key = `${userId}:${commandName}`;
    const now = Date.now();
    const userLimit = rateLimitMap.get(key);
    
    if (!userLimit) {
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { allowed: true, remaining: limit - 1 };
    }
    
    if (now > userLimit.resetTime) {
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { allowed: true, remaining: limit - 1 };
    }
    
    if (userLimit.count >= limit) {
        return { 
            allowed: false, 
            remaining: 0,
            resetTime: userLimit.resetTime
        };
    }
    
    userLimit.count++;
    return { 
        allowed: true, 
        remaining: limit - userLimit.count,
        resetTime: userLimit.resetTime
    };
}

function clearRateLimit(userId, commandName) {
    const key = `${userId}:${commandName}`;
    rateLimitMap.delete(key);
}

function getRateLimitInfo(userId, commandName) {
    const key = `${userId}:${commandName}`;
    const userLimit = rateLimitMap.get(key);
    
    if (!userLimit) return null;
    
    return {
        count: userLimit.count,
        resetTime: userLimit.resetTime,
        timeRemaining: Math.max(0, userLimit.resetTime - Date.now())
    };
}

// Auto cleanup
setInterval(() => {
    const now = Date.now();
    for (const [key, limit] of rateLimitMap.entries()) {
        if (now > limit.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 300000); // 5 dakikada bir temizle

module.exports = {
    checkRateLimit,
    clearRateLimit,
    getRateLimitInfo
};
