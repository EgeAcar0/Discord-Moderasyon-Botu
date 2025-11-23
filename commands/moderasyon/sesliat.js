const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('sesliat')
        .setDescription('Bir kullanıcıyı bulunduğu sesli kanaldan atar (disconnect).')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Sesli kanaldan atılacak kullanıcı')
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
        await member.voice.disconnect().catch(() => {
            return interaction.reply({ content: '❌ Kullanıcıyı sesli kanaldan atarken bir hata oluştu. Yetkim yetmiyor olabilir.', ephemeral: true });
        });
        await interaction.reply({ content: `✅ ${user.tag} kullanıcısı sesli kanaldan atıldı.`, ephemeral: true });
    },
}; 