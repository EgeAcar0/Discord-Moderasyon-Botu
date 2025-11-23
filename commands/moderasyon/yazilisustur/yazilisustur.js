const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const ayarlar = require(process.cwd() + '/ayarlar.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yazilisustur')
        .setDescription('Bir kullanıcıyı yazılı kanallarda belirli bir süre susturur (susturulmuş rolü verir).')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Yazılı susturulacak kullanıcı')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('sure')
                .setDescription('Susturma süresi (dakika)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('Susturma sebebi')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }
        const user = interaction.options.getUser('hedef');
        const sure = interaction.options.getInteger('sure');
        const sebep = interaction.options.getString('sebep');
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
        await member.roles.add(muteRole);
        user.send(`❗ ${interaction.guild.name} sunucusunda ${sure} dakika boyunca yazılı susturuldun. Sebep: ${sebep}`).catch(() => {});
        await interaction.reply({ content: `✅ ${user.tag} kullanıcısı ${sure} dakika boyunca yazılı susturuldu. Sebep: ${sebep}`, ephemeral: true });
        setTimeout(async () => {
            const freshMember = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (freshMember && freshMember.roles.cache.has(muteRole.id)) {
                await freshMember.roles.remove(muteRole).catch(() => {});
            }
        }, sure * 60 * 1000);
    },
}; 