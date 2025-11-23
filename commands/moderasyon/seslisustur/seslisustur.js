const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seslisustur')
        .setDescription('Bir kullanıcıyı sesli kanalda belirli bir süre susturur (server mute).')
        .addUserOption(option =>
            option.setName('hedef')
                .setDescription('Sesli susturulacak kullanıcı')
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
        if (!member.voice.channel) {
            return interaction.reply({ content: '❌ Kullanıcı herhangi bir sesli kanalda değil.', ephemeral: true });
        }
        await member.voice.setMute(true, sebep).catch(() => {
            return interaction.reply({ content: '❌ Kullanıcıyı sesli sustururken bir hata oluştu. Yetkim yetmiyor olabilir.', ephemeral: true });
        });
        user.send(`❗ ${interaction.guild.name} sunucusunda ${sure} dakika boyunca sesli susturuldun. Sebep: ${sebep}`).catch(() => {});
        await interaction.reply({ content: `✅ ${user.tag} kullanıcısı ${sure} dakika boyunca sesli susturuldu. Sebep: ${sebep}`, ephemeral: true });
        setTimeout(async () => {
            const freshMember = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (freshMember && freshMember.voice.serverMute) {
                await freshMember.voice.setMute(false, 'Süre doldu, susturma kaldırıldı.').catch(() => {});
            }
        }, sure * 60 * 1000);
    },
}; 