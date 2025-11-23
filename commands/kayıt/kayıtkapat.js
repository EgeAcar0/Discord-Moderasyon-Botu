const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const kayitPath = path.join(__dirname, '../../kayıt.json');

function deleteKayitAyar(guildId) {
    if (!fs.existsSync(kayitPath)) return;
    const data = JSON.parse(fs.readFileSync(kayitPath, 'utf8'));
    delete data[guildId];
    fs.writeFileSync(kayitPath, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıtkapat')
        .setDescription('Kayıt sistemini kapatır ve tüm ayarları sıfırlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        deleteKayitAyar(guildId);
        await interaction.reply({ content: '✅ Kayıt sistemi kapatıldı ve tüm ayarlar sıfırlandı.', ephemeral: true });
    }
}; 