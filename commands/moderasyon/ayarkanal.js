const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const ayarlar = require(process.cwd() + '/ayarlar.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayarkanal')
        .setDescription('Bot kanal ayarlarını yapar.')
        .addChannelOption(option =>
            option.setName('botkanali')
                .setDescription('Bot komutlarının çalışacağı kanal')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('oyunkanali1')
                .setDescription('Oyun komutlarının çalışacağı 1. kanal')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('oyunkanali2')
                .setDescription('Oyun komutlarının çalışacağı 2. kanal')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('oyunkanali3')
                .setDescription('Oyun komutlarının çalışacağı 3. kanal')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('olaylogkanali')
                .setDescription('Olay log kanalı')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('davetlogkanali')
                .setDescription('Davet log kanalı')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        ayarlar[guildId] = ayarlar[guildId] || {};

        const botKanali = interaction.options.getChannel('botkanali');
        const oyunKanali1 = interaction.options.getChannel('oyunkanali1');
        const oyunKanali2 = interaction.options.getChannel('oyunkanali2');
        const oyunKanali3 = interaction.options.getChannel('oyunkanali3');
        const olayLogKanali = interaction.options.getChannel('olaylogkanali');
        const davetLogKanali = interaction.options.getChannel('davetlogkanali');

        if(botKanali) ayarlar[guildId].botKomutKanaliId = botKanali.id;

        ayarlar[guildId].oyunKanallariIds = [];
        if(oyunKanali1) ayarlar[guildId].oyunKanallariIds.push(oyunKanali1.id);
        if(oyunKanali2) ayarlar[guildId].oyunKanallariIds.push(oyunKanali2.id);
        if(oyunKanali3) ayarlar[guildId].oyunKanallariIds.push(oyunKanali3.id);

        if(olayLogKanali) ayarlar[guildId].olayLogKanalId = olayLogKanali.id;
        if(davetLogKanali) ayarlar[guildId].davetLogKanalId = davetLogKanali.id;

        fs.writeFileSync('./ayarlar.json', JSON.stringify(ayarlar, null, 4));

        await interaction.reply({
            content: `✅ Kanal ayarları güncellendi.`,
            ephemeral: true
        });
    }
}; 