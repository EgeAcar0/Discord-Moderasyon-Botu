const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const kayitPath = path.join(__dirname, '../../kayıt.json');
const kayitlogPath = path.join(__dirname, '../../kayitlog.json');

function getKayitAyar(guildId) {
    if (!fs.existsSync(kayitPath)) return {};
    const data = JSON.parse(fs.readFileSync(kayitPath, 'utf8'));
    return data[guildId] || {};
}

function addKayitLog(guildId, moderator, user, action) {
    let data = [];
    if (fs.existsSync(kayitlogPath)) data = JSON.parse(fs.readFileSync(kayitlogPath, 'utf8'));
    data.push({
        guildId,
        moderator: { tag: moderator.tag, id: moderator.id },
        user: { tag: user.tag, id: user.id },
        action,
        date: new Date().toISOString()
    });
    fs.writeFileSync(kayitlogPath, JSON.stringify(data, null, 4));
}
function sendKayitLogChannel(guild, moderator, user, action) {
    const ayar = getKayitAyar(guild.id);
    const logChannelId = ayar.kayıtlogkanalı || ayar.kayıtkanalı;
    if (ayar && logChannelId) {
        const logChannel = guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send({ content: `📋 **Kayıt Logu**\nKayıtsıza alan: ${moderator.tag} (<@${moderator.id}>)\nKayıtsıza alınan: ${user.tag} (<@${user.id}>)\nİşlem: ${action}\nTarih: <t:${Math.floor(Date.now()/1000)}:f>` });
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıtal')
        .setDescription('Bir kullanıcıdan tüm rolleri alır ve kayıtsız rolünü verir.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Kayıtsıza alınacak kullanıcı')
                .setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const ayar = getKayitAyar(guildId);
        if (!ayar.kayıtedenrol || !ayar.kayıtsızrol) {
            return interaction.reply({ content: '❌ Kayıt sistemi tam kurulmamış.', ephemeral: true });
        }
        if (!interaction.member.roles.cache.has(ayar.kayıtedenrol)) {
            return interaction.reply({ content: '❌ Bu komutu kullanmak için kayıt yetkili rolüne sahip olmalısın.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ Kullanıcı sunucuda bulunamadı.', ephemeral: true });
        }
        // Tüm rolleri al ve kayıtsız rolünü ver
        const rolesToRemove = member.roles.cache.filter(r => r.id !== ayar.kayıtsızrol && r.editable);
        await member.roles.remove(rolesToRemove).catch(() => {});
        await member.roles.add(ayar.kayıtsızrol).catch(() => {});
        // İsmi sıfırla
        await member.setNickname(member.user.username).catch(() => {});
        await interaction.reply({ content: `✅ ${user.tag} kayıtsıza alındı.`, ephemeral: false });
        addKayitLog(guildId, interaction.user, user, 'kayıtsıza alındı');
        sendKayitLogChannel(interaction.guild, interaction.user, user, 'kayıtsıza alındı');
    },
}; 