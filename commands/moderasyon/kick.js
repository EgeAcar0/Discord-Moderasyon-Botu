const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const ayarlar = require(process.cwd() + '/ayarlar.json');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Bir kullanıcıyı sunucudan atar.")
        .addUserOption(option =>
            option.setName("hedef")
                .setDescription("Atılacak kullanıcı")
                .setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const config = ayarlar[guildId] || {};

        // Yetkili rolü kontrolü
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: "❌ Bu komutu kullanmak için yetkiniz yok.", ephemeral: true });
        }

        const user = interaction.options.getUser("hedef");
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: "❌ Kullanıcı sunucuda bulunamadı.", ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: "❌ Bu kullanıcıyı atmak için yetkim yok.", ephemeral: true });
        }

        await member.kick();
        await interaction.reply(`✅ ${user.tag} sunucudan atıldı.`);
    },
};
