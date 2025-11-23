const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const fs = require('fs');
const path = require('path');
const warnsPath = path.join(__dirname, '../../warns.json');

function getWarns() {
    if (!fs.existsSync(warnsPath)) return {};
    return JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Show all warnings in the server.'),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const warns = getWarns();
        const guildId = interaction.guild.id;
        const guildWarns = warns[guildId] || {};
        const userIds = Object.keys(guildWarns).filter(uid => guildWarns[uid].length > 0);
        if (userIds.length === 0) {
            return interaction.reply({ content: '✅ No warnings in this server.', ephemeral: true });
        }
        // List users and their warn counts
        let desc = '';
        for (const uid of userIds) {
            const member = await interaction.guild.members.fetch(uid).catch(() => null);
            desc += `${member ? member.user.tag : `<@${uid}>`} - **${guildWarns[uid].length} warn(s)**\n`;
        }
        const embed = new EmbedBuilder()
            .setTitle('⚠️ Server Warnings')
            .setDescription(desc)
            .setColor(0xFFAA00)
            .setFooter({ text: 'Click a button below to see details for a user.' });
        // Create a button for each user (max 5 for Discord limitation)
        const row = new ActionRowBuilder();
        userIds.slice(0, 5).forEach(uid => {
            const member = interaction.guild.members.cache.get(uid);
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`warns_${uid}`)
                    .setLabel(member ? member.user.username : uid)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👤')
            );
        });
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        // Collector for button interaction
        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });
        collector.on('collect', async i => {
            if (!i.customId.startsWith('warns_')) return;
            const uid = i.customId.replace('warns_', '');
            const warnsList = guildWarns[uid] || [];
            if (warnsList.length === 0) {
                return i.reply({ content: 'No warnings for this user.', ephemeral: true });
            }
            let warnDesc = '';
            warnsList.slice(-10).reverse().forEach((w, idx) => {
                warnDesc += `**${warnsList.length - idx}.** Reason: ${w.reason}\nModerator: ${w.moderator}\nDate: <t:${Math.floor(new Date(w.date).getTime()/1000)}:f>\n---\n`;
            });
            const userTag = (await interaction.guild.members.fetch(uid).catch(() => null))?.user.tag || `<@${uid}>`;
            const warnEmbed = new EmbedBuilder()
                .setTitle(`⚠️ Warnings for ${userTag}`)
                .setDescription(warnDesc)
                .setColor(0xFF5555);
            await i.reply({ embeds: [warnEmbed], ephemeral: true });
        });
    },
}; 