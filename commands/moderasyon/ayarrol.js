const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const ayarlar = require(process.cwd() + '/ayarlar.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayarrol')
        .setDescription('Bot rol ayarlarını yapar.')
        .addRoleOption(option =>
            option.setName('yetkili1')
                .setDescription('Yetkili rolü 1')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('yetkili2')
                .setDescription('Yetkili rolü 2')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('yetkili3')
                .setDescription('Yetkili rolü 3')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('susturulmusrol')
                .setDescription('Susturulmuş kullanıcı rolü')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('uyarirol1')
                .setDescription('1. uyarı rolü')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('uyarirol2')
                .setDescription('2. uyarı rolü')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('uyarirol3')
                .setDescription('3. uyarı rolü')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('botrol')
            .setDescription('Bot rolü')
            .setRequired(false))
        .addRoleOption(option =>
            option.setName('ilkrol')
            .setDescription('Sunucuya yeni katılanlara verilecek rol')
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        ayarlar[guildId] = ayarlar[guildId] || {};

        const yetkili1 = interaction.options.getRole('yetkili1');
        const yetkili2 = interaction.options.getRole('yetkili2');
        const yetkili3 = interaction.options.getRole('yetkili3');
        const susturulmusRol = interaction.options.getRole('susturulmusrol');
        const uyariRol1 = interaction.options.getRole('uyarirol1');
        const uyariRol2 = interaction.options.getRole('uyarirol2');
        const uyariRol3 = interaction.options.getRole('uyarirol3');
        const botrol = interaction.options.getRole('botrol');
        const ilkrol = interaction.options.getRole('ilkrol');

        ayarlar[guildId].yetkiliRolIds = [];
        if(yetkili1) ayarlar[guildId].yetkiliRolIds.push(yetkili1.id);
        if(yetkili2) ayarlar[guildId].yetkiliRolIds.push(yetkili2.id);
        if(yetkili3) ayarlar[guildId].yetkiliRolIds.push(yetkili3.id);
        if(susturulmusRol) ayarlar[guildId].susturulmusRolId = susturulmusRol.id;
        if(uyariRol1) ayarlar[guildId].uyariRol1Id = uyariRol1.id;
        if(uyariRol2) ayarlar[guildId].uyariRol2Id = uyariRol2.id;
        if(uyariRol3) ayarlar[guildId].uyariRol3Id = uyariRol3.id;
        if(botrol) ayarlar[guildId].botrolId = botrol.id;
        if(ilkrol) ayarlar[guildId].ilkRolId = ilkrol.id;

        fs.writeFileSync('./ayarlar.json', JSON.stringify(ayarlar, null, 4));

        await interaction.reply({
            content: `✅ Rol ayarları güncellendi.`,
            ephemeral: true
        });
    }
}; 