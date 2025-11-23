// Input validation utilities

function validateUserId(userId) {
    if (!userId || typeof userId !== 'string') return false;
    return /^\d{17,19}$/.test(userId);
}

function validateRoleId(roleId) {
    if (!roleId || typeof roleId !== 'string') return false;
    return /^\d{17,19}$/.test(roleId);
}

function validateChannelId(channelId) {
    if (!channelId || typeof channelId !== 'string') return false;
    return /^\d{17,19}$/.test(channelId);
}

function validateGuildId(guildId) {
    if (!guildId || typeof guildId !== 'string') return false;
    return /^\d{17,19}$/.test(guildId);
}

function validateReason(reason) {
    if (!reason || typeof reason !== 'string') return false;
    if (reason.length < 3 || reason.length > 500) return false;
    return !/<[^>]*>/.test(reason); // HTML tag'leri engelle
}

function validateDuration(duration) {
    if (!duration || typeof duration !== 'string') return false;
    const timePatterns = [
        /^\d+[smhd]$/, // 10s, 5m, 2h, 1d
        /^\d+(?:s|m|h|d)$/ // 10s, 5m, 2h, 1d
    ];
    return timePatterns.some(pattern => pattern.test(duration.toLowerCase()));
}

function validateMessageContent(content) {
    if (!content || typeof content !== 'string') return false;
    if (content.length > 2000) return false; // Discord limit
    return true;
}

function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[\x00-\x1F\x7F]/g, '') // Control karakterleri temizle
        .slice(0, 1000); // Max uzunluk
}

module.exports = {
    validateUserId,
    validateRoleId,
    validateChannelId,
    validateGuildId,
    validateReason,
    validateDuration,
    validateMessageContent,
    sanitizeInput
};
