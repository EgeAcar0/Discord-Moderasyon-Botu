const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const ayarlar = require(process.cwd() + '/ayarlar.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yazilisusturac')
        .setDescription('Bir kullanıcının yazılı susturmasını kaldırır (susturulmuş rolünü alır).')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Yazılı susturması kaldırılacak kullanıcı')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }
        const user = interaction.options.getUser('hedef');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı.', ephemeral: true });
        }
        const guildId = interaction.guild.id;
        const config = ayarlar[guildId] || {};
        const muteRoleId = config.susturulmusRolId;
        if (!muteRoleId) {
            return interaction.reply({ content: '❌ Susturulmuş rolü ayarlanmamış. /ayar komutundan susturulmuş rolü seçmelisin.', ephemeral: true });
        }
        const muteRole = interaction.guild.roles.cache.get(muteRoleId);
        if (!muteRole) {
            return interaction.reply({ content: '❌ Susturulmuş rolü sunucuda bulunamadı. /ayar komutundan tekrar ayarlayın.', ephemeral: true });
        }
        if (!member.roles.cache.has(muteRole.id)) {
            return interaction.reply({ content: '❌ Kullanıcı zaten yazılı susturulmamış.', ephemeral: true });
        }
        await member.roles.remove(muteRole);
        await interaction.reply({ content: `✅ ${user.tag} kullanıcısının yazılı susturması kaldırıldı.`, ephemeral: true });
    },
}; 