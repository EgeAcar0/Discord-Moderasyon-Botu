const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Bir kullanıcının banını kaldırır.')
        .addStringOption(option =>
            option.setName('kullaniciid')
                .setDescription('Banı kaldırılacak kullanıcının IDsi')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }
        const userId = interaction.options.getString('kullaniciid');
        try {
            await interaction.guild.bans.remove(userId);
            await interaction.reply({ content: `✅ ${userId} ID'li kullanıcının banı kaldırıldı.`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: '❌ Ban kaldırılırken bir hata oluştu. Kullanıcı ID doğru mu, banlı mı ve yetkin var mı kontrol et.', ephemeral: true });
        }
    },
}; 