const ayarlar = require(process.cwd() + '/ayarlar.json'); 

function isAuthorized(member) {
    const guildId = member.guild.id;
    const authorizedRoles = (ayarlar[guildId] && ayarlar[guildId].yetkiliRolIds) || [];
    return member.roles.cache.some(role => authorizedRoles.includes(role.id));
}

function isNormal(member) {
    return !isAuthorized(member);
}

module.exports = { isAuthorized, isNormal }; 