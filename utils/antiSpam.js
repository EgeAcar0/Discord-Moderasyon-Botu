// Anti-spam and content filtering utilities

const antiSpamConfig = require('../config/antispam.json');
const { addWarn } = require('./database');

// Message history for spam detection
const messageHistory = new Map();

// Check if user has admin/moderator roles
function hasStaffRole(member, config) {
    if (!member || !config) return false;
    
    const staffRoles = [
        config.yetkiliRol1Id,
        config.yetkiliRol2Id, 
        config.yetkiliRol3Id
    ].filter(roleId => roleId); // Filter out null/undefined
    
    if (staffRoles.length === 0) return false;
    
    return member.roles.cache.some(role => staffRoles.includes(role.id));
}

// Spam detection
function checkSpam(message, config) {
    if (!antiSpamConfig.enabled || !antiSpamConfig.spam.enabled) return { allowed: true };
    
    const userId = message.author.id;
    const now = Date.now();
    const userHistory = messageHistory.get(userId) || [];
    
    // Clean old messages
    const recentMessages = userHistory.filter(msg => 
        now - msg.timestamp < antiSpamConfig.spam.timeWindow
    );
    
    // Add current message
    recentMessages.push({ timestamp: now });
    messageHistory.set(userId, recentMessages);
    
    // Check if user exceeded message limit
    if (recentMessages.length > antiSpamConfig.spam.maxMessages) {
        return {
            allowed: false,
            reason: 'spam',
            action: antiSpamConfig.spam.action,
            message: antiSpamConfig.spam.warnMessage
        };
    }
    
    return { allowed: true };
}

// Link detection
function checkLinks(message, config) {
    if (!antiSpamConfig.enabled || !antiSpamConfig.links.enabled) return { allowed: true };
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);
    
    if (!urls) return { allowed: true };
    
    // Check if any URL is not in allowed domains
    for (const url of urls) {
        let domain = url.replace(/^https?:\/\//, '').split('/')[0];
        domain = domain.toLowerCase();
        
        const isAllowed = antiSpamConfig.links.allowedDomains.some(allowedDomain => 
            domain.includes(allowedDomain.toLowerCase())
        );
        
        if (!isAllowed) {
            return {
                allowed: false,
                reason: 'link',
                action: antiSpamConfig.links.action,
                message: antiSpamConfig.links.warnMessage,
                url: url
            };
        }
    }
    
    return { allowed: true };
}

// Caps lock detection
function checkCaps(message, config) {
    if (!antiSpamConfig.enabled || !antiSpamConfig.caps.enabled) return { allowed: true };
    
    const content = message.content.trim();
    
    // Skip short messages
    if (content.length < antiSpamConfig.caps.minLength) return { allowed: true };
    
    // Count uppercase letters
    const uppercaseCount = (content.match(/[A-Z]/g) || []).length;
    const uppercasePercentage = (uppercaseCount / content.length) * 100;
    
    if (uppercasePercentage > antiSpamConfig.caps.maxCapsPercentage) {
        return {
            allowed: false,
            reason: 'caps',
            action: antiSpamConfig.caps.action,
            message: antiSpamConfig.caps.warnMessage
        };
    }
    
    return { allowed: true };
}

// Mass mentions detection
function checkMassMentions(message, config) {
    if (!antiSpamConfig.enabled || !antiSpamConfig.massMentions.enabled) return { allowed: true };
    
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    
    if (mentionCount > antiSpamConfig.massMentions.maxMentions) {
        return {
            allowed: false,
            reason: 'mass_mentions',
            action: antiSpamConfig.massMentions.action,
            message: antiSpamConfig.massMentions.warnMessage
        };
    }
    
    return { allowed: true };
}

// Main anti-spam check function
async function checkAntiSpam(message, guildConfig) {
    // Skip staff members
    if (hasStaffRole(message.member, guildConfig)) {
        return { allowed: true };
    }
    
    // Run all checks
    const checks = [
        checkSpam(message, guildConfig),
        checkLinks(message, guildConfig),
        checkCaps(message, guildConfig),
        checkMassMentions(message, guildConfig)
    ];
    
    for (const check of checks) {
        if (!check.allowed) {
            // Add warning if action is 'warn'
            if (check.action === 'warn') {
                try {
                    await addWarn(message.guild.id, message.author.id, message.client.user.id, 'AutoMod', `Anti-Spam: ${check.reason}`);
                } catch (error) {
                    console.error('Anti-spam warning failed:', error);
                }
            }
            
            return check;
        }
    }
    
    return { allowed: true };
}

// Clean up old message history
function cleanupMessageHistory() {
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    for (const [userId, messages] of messageHistory.entries()) {
        const recentMessages = messages.filter(msg => now - msg.timestamp < maxAge);
        
        if (recentMessages.length === 0) {
            messageHistory.delete(userId);
        } else {
            messageHistory.set(userId, recentMessages);
        }
    }
}

// Auto cleanup every 30 seconds
setInterval(cleanupMessageHistory, 30000);

module.exports = {
    checkAntiSpam,
    hasStaffRole,
    cleanupMessageHistory
};
