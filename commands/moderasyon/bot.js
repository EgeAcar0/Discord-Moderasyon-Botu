// commands/bot.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const ayarlar = require(process.cwd() + '/ayarlar.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bot")
        .setDescription("Ayarlanmış bot rolünü kullanıcıya verir veya alır.")
        .addUserOption(option =>
            option.setName("hedef")
                .setDescription("Bot rolü verilecek/alınacak kullanıcı")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Yine ManageRoles ama kontrol bizde

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const config = ayarlar[guildId] || {};

        // Yetkili rolü varsa ve komut kullanan kişi yetkili değilse izin verme
        if (config.yetkiliRolId) {
            const yetkiliRol = interaction.guild.roles.cache.get(config.yetkiliRolId);
            if (yetkiliRol && !interaction.member.roles.cache.has(yetkiliRol.id)) {
                // Ama bot komutunda herkes kullanabilsin diyorsan bu kısmı kaldır
                // İstersen yetkili rolü sadece diğer komutlarda zorunlu olsun
            }
        }

        // Herkes kullanabilir kısmı için burada kontrol yapma

        const user = interaction.options.getUser("hedef");
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: "❌ Kullanıcı bulunamadı.", ephemeral: true });
        }

        const botrole = config.botrolId ? interaction.guild.roles.cache.get(config.botrolId) : null;
        if (!botrole) {
            return interaction.reply({
                content: "⚠️ Bu sunucuda henüz bir bot rolü ayarlanmamış. Lütfen `/ayarrol` komutu ile ayarla.",
                ephemeral: true
            });
        }

        if (!interaction.guild.members.me.permissions.has("ManageRoles")) {
            return interaction.reply({ content: "❌ Rol verme yetkim yok.", ephemeral: true });
        }

        if (member.roles.cache.has(botrole.id)) {
            await member.roles.remove(botrole);
            await interaction.reply(`✅ ${user.tag} kullanıcısından '${botrole.name}' rolü alındı.`);
        } else {
            await member.roles.add(botrole);
            await interaction.reply(`✅ ${user.tag} kullanıcısına '${botrole.name}' rolü verildi.`);
        }
    }
};
