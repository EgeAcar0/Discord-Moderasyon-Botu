const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seslisusturac')
        .setDescription('Bir kullanıcının sesli susturmasını kaldırır (server unmute).')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Sesli susturması kaldırılacak kullanıcı')
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
        if (!member.voice.channel) {
            return interaction.reply({ content: '❌ Kullanıcı herhangi bir sesli kanalda değil.', ephemeral: true });
        }
        if (!member.voice.serverMute) {
            return interaction.reply({ content: '❌ Kullanıcı zaten sesli susturulmamış.', ephemeral: true });
        }
        await member.voice.setMute(false, 'Susturma kaldırıldı.');
        await interaction.reply({ content: `✅ ${user.tag} kullanıcısının sesli susturması kaldırıldı.`, ephemeral: true });
    },
}; 