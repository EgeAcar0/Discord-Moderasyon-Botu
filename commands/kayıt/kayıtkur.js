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
        .setName('kayıtkur')
        .setDescription('Kayıt sistemini kurar.')
        .addRoleOption(option =>
            option.setName('kayıtedenrol')
                .setDescription('Kayıt yapmaya yetkili rol')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('kayıtsızrol')
                .setDescription('Kayıtsız rolü (kayıt edilen rol)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('kayıtkanalı')
                .setDescription('Kayıt yapılacak kanal')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('girisrol')
                .setDescription('Sunucuya girince verilecek rol (kayıtsız rol)')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('ekrol')
                .setDescription('Kayıttan sonra verilecek ek rol (isteğe bağlı)')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('kayıtlogkanalı')
                .setDescription('Kayıt loglarının atılacağı kanal')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const mevcutAyar = getKayitAyar(guildId);
        if (mevcutAyar && mevcutAyar.kayıtedenrol && mevcutAyar.kayıtsızrol) {
            return interaction.reply({ content: '❌ Bu sunucuda kayıt sistemi zaten kurulmuş. Düzenlemek için /kayıtdüzenle komutunu kullanın.', ephemeral: true });
        }
        const kayıtedenrol = interaction.options.getRole('kayıtedenrol');
        const kayıtsızrol = interaction.options.getRole('kayıtsızrol');
        const ekrol = interaction.options.getRole('ekrol');
        const kayıtkanalı = interaction.options.getChannel('kayıtkanalı');
        const girisrol = interaction.options.getRole('girisrol');
        const kayıtlogkanalı = interaction.options.getChannel('kayıtlogkanalı');

        if (!kayıtsızrol) {
            return interaction.reply({ content: '❌ Kayıtsız rolü seçilmeden kayıt sistemi kurulamaz.', ephemeral: true });
        }

        saveKayitAyar(guildId, {
            kayıtedenrol: kayıtedenrol.id,
            kayıtsızrol: kayıtsızrol.id,
            ekrol: ekrol ? ekrol.id : null,
            kayıtkanalı: kayıtkanalı.id,
            girisrol: girisrol.id,
            kayıtlogkanalı: kayıtlogkanalı ? kayıtlogkanalı.id : null
        });

        await interaction.reply({
            content: `✅ Kayıt sistemi başarıyla kuruldu!\n- Kayıt eden rol: <@&${kayıtedenrol.id}>\n- Kayıtsız rol: <@&${kayıtsızrol.id}>\n- Ek rol: ${ekrol ? `<@&${ekrol.id}>` : 'Yok'}\n- Kayıt kanalı: <#${kayıtkanalı.id}>\n- Girişte verilecek rol: <@&${girisrol.id}>\n- Kayıt log kanalı: ${kayıtlogkanalı ? `<#${kayıtlogkanalı.id}>` : 'Yok'}`,
            ephemeral: true
        });
    }
}; 