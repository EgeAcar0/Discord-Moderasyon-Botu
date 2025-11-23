const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const kayitPath = path.join(__dirname, '../../kayıt.json');

function getKayitAyar(guildId) {
    if (!fs.existsSync(kayitPath)) return {};
    const data = JSON.parse(fs.readFileSync(kayitPath, 'utf8'));
    return data[guildId] || {};
}
function saveKayitAyar(guildId, ayar) {
    let data = {};
    if (fs.existsSync(kayitPath)) data = JSON.parse(fs.readFileSync(kayitPath, 'utf8'));
    data[guildId] = ayar;
    fs.writeFileSync(kayitPath, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıtdüzenle')
        .setDescription('Kayıt sisteminin ayarlarını düzenle.')
        .addRoleOption(option =>
            option.setName('kayıtedenrol')
                .setDescription('Kayıt yapmaya yetkili rol')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('kayıtsızrol')
                .setDescription('Kayıtsız rolü (kayıt edilen rol)')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('ekrol')
                .setDescription('Kayıttan sonra verilecek ek rol (isteğe bağlı)')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('kayıtkanalı')
                .setDescription('Kayıt yapılacak kanal')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('girisrol')
                .setDescription('Sunucuya girince verilecek rol (kayıtsız rol)')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('kayıtlogkanalı')
                .setDescription('Kayıt loglarının atılacağı kanal')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const ayar = getKayitAyar(guildId);
        if (!ayar.kayıtedenrol || !ayar.kayıtsızrol) {
            return interaction.reply({ content: '❌ Kayıt sistemi daha önce kurulmamış.', ephemeral: true });
        }
        let degisenler = [];
        const kayıtedenrol = interaction.options.getRole('kayıtedenrol');
        const kayıtsızrol = interaction.options.getRole('kayıtsızrol');
        const ekrol = interaction.options.getRole('ekrol');
        const kayıtkanalı = interaction.options.getChannel('kayıtkanalı');
        const girisrol = interaction.options.getRole('girisrol');
        const kayıtlogkanalı = interaction.options.getChannel('kayıtlogkanalı');
        if (kayıtedenrol) { ayar.kayıtedenrol = kayıtedenrol.id; degisenler.push('Kayıt eden rol'); }
        if (kayıtsızrol) { ayar.kayıtsızrol = kayıtsızrol.id; degisenler.push('Kayıtsız rol'); }
        if (ekrol) { ayar.ekrol = ekrol.id; degisenler.push('Ek rol'); }
        if (kayıtkanalı) { ayar.kayıtkanalı = kayıtkanalı.id; degisenler.push('Kayıt kanalı'); }
        if (girisrol) { ayar.girisrol = girisrol.id; degisenler.push('Girişte verilecek rol'); }
        if (kayıtlogkanalı) { ayar.kayıtlogkanalı = kayıtlogkanalı.id; degisenler.push('Kayıt log kanalı'); }
        saveKayitAyar(guildId, ayar);
        await interaction.reply({
            content: degisenler.length > 0 ? `✅ Kayıt ayarları güncellendi: ${degisenler.join(', ')}` : 'ℹ️ Hiçbir ayar değişmedi.',
            ephemeral: true
        });
    }
}; 