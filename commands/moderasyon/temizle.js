const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temizle')
        .setDescription('Belirtilen sayıda mesajı siler (en fazla 100).')
        .addIntegerOption(option =>
            option.setName('sayi')
                .setDescription('Silinecek mesaj sayısı (1-100)')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }
        const sayi = interaction.options.getInteger('sayi');
        if (sayi < 1 || sayi > 100) {
            return interaction.reply({ content: '❌ 1 ile 100 arasında bir sayı girmelisin.', ephemeral: true });
        }
        const deleted = await interaction.channel.bulkDelete(sayi, true).catch(() => null);
        if (!deleted) {
            return interaction.reply({ content: '❌ Mesajlar silinemedi. 14 günden eski mesajlar silinemez.', ephemeral: true });
        }
        await interaction.reply({ content: `✅ ${deleted.size} mesaj silindi.`, ephemeral: true });
    },
}; 