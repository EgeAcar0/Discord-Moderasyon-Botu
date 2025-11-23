const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const kayitPath = path.join(__dirname, '../../kayıt.json');
const notesPath = path.join(__dirname, '../../notes.json');
const kayitlogPath = path.join(__dirname, '../../kayitlog.json');

function getKayitAyar(guildId) {
    if (!fs.existsSync(kayitPath)) return {};
    const data = JSON.parse(fs.readFileSync(kayitPath, 'utf8'));
    return data[guildId] || {};
}
function getNotes() {
    if (!fs.existsSync(notesPath)) return {};
    return JSON.parse(fs.readFileSync(notesPath, 'utf8'));
}
function saveNotes(notes) {
    fs.writeFileSync(notesPath, JSON.stringify(notes, null, 4));
}
function addKayitLog(guildId, moderator, user) {
    let data = [];
    if (fs.existsSync(kayitlogPath)) data = JSON.parse(fs.readFileSync(kayitlogPath, 'utf8'));
    data.push({
        guildId,
        moderator: { tag: moderator.tag, id: moderator.id },
        user: { tag: user.tag, id: user.id },
        date: new Date().toISOString()
    });
    fs.writeFileSync(kayitlogPath, JSON.stringify(data, null, 4));
}

function sendKayitLogChannel(guild, moderator, user) {
    const ayar = getKayitAyar(guild.id);
    const logChannelId = ayar.kayıtlogkanalı || ayar.kayıtkanalı;
    if (ayar && logChannelId) {
        const logChannel = guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send({ content: `📋 **Kayıt Logu**\nKayıt eden: ${moderator.tag} (<@${moderator.id}>)\nKayıt edilen: ${user.tag} (<@${user.id}>)\nTarih: <t:${Math.floor(Date.now()/1000)}:f>` });
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt')
        .setDescription('Bir kullanıcıyı kayıt eder.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Kayıt edilecek kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('isim')
                .setDescription('Sunucu içi isim (boş bırakılırsa değişmez)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('yas')
                .setDescription('Yaş (note olarak kaydedilir)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('Tag (boş bırakılabilir)')
                .setRequired(false)),
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
        // Kayıtsız rolü kontrolü
        if (!member.roles.cache.has(ayar.kayıtsızrol)) {
            return interaction.reply({ content: '❌ Bu kullanıcı zaten kayıtlı veya kayıtsız rolü yok.', ephemeral: true });
        }
        // İsim ve tag
        const isim = interaction.options.getString('isim');
        const yas = interaction.options.getInteger('yas');
        const tag = interaction.options.getString('tag');
        let newNick = isim || member.displayName;
        if (tag) newNick += ` | ${tag}`;
        await member.setNickname(newNick).catch(() => {});
        // Roller
        await member.roles.remove(ayar.kayıtsızrol).catch(() => {});
        if (ayar.ekrol) await member.roles.add(ayar.ekrol).catch(() => {});
        // Not (yaş)
        if (yas) {
            const notes = getNotes();
            notes[guildId] = notes[guildId] || {};
            notes[guildId][user.id] = notes[guildId][user.id] || [];
            notes[guildId][user.id].push({
                moderator: interaction.user.tag,
                moderatorId: interaction.user.id,
                date: new Date().toISOString(),
                note: `Kayıt yaşı: ${yas}`
            });
            saveNotes(notes);
        }
        await interaction.reply({ content: `✅ ${user.tag} başarıyla kayıt edildi.`, ephemeral: false });
        addKayitLog(guildId, interaction.user, user);
        sendKayitLogChannel(interaction.guild, interaction.user, user);
    },
}; 