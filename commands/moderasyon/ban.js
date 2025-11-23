const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const ayarlar = require(process.cwd() + '/ayarlar.json');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bir kullanıcıyı sunucudan yasaklar.")
        .addUserOption(option =>
            option.setName("hedef")
                .setDescription("Banlanacak kullanıcı")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("sebep")
                .setDescription("Ban sebebi (isteğe bağlı)")
                .setRequired(false)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const config = ayarlar[guildId] || {};

        // Yetkili rol kontrolü
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: "❌ Bu komutu kullanmak için yetkiniz yok.", ephemeral: true });
        }

        const user = interaction.options.getUser("hedef");
        const reason = interaction.options.getString("sebep") || "Belirtilmedi";

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: "❌ Kullanıcı sunucuda bulunamadı.", ephemeral: true });
        }

        if (!member.bannable) {
            return interaction.reply({ content: "❌ Bu kullanıcıyı banlamak için yetkim yok.", ephemeral: true });
        }

        await member.ban({ reason });
        await interaction.reply(`✅ ${user.tag} banlandı. Sebep: ${reason}`);
    },
};
