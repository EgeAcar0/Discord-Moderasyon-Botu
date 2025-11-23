const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('kullaniciadi')
        .setDescription('Bir kullanıcının sunucudaki takma adını değiştirir.')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Takma adı değiştirilecek kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('yeniad')
                .setDescription('Yeni takma ad')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }
        const user = interaction.options.getUser('hedef');
        const yeniad = interaction.options.getString('yeniad');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı.', ephemeral: true });
        }
        await member.setNickname(yeniad).catch(() => {
            return interaction.reply({ content: '❌ Takma ad değiştirilemedi. Yetkim yetmiyor olabilir.', ephemeral: true });
        });
        await interaction.reply({ content: `✅ ${user.tag} kullanıcısının takma adı "${yeniad}" olarak değiştirildi.`, ephemeral: true });
    },
}; 