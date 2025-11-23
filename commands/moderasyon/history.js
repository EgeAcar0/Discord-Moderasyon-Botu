const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const fs = require('fs');
const path = require('path');
const warnsPath = path.join(__dirname, '../../warns.json');
const notesPath = path.join(__dirname, '../../notes.json');

function getWarns() {
    if (!fs.existsSync(warnsPath)) return {};
    return JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
}
function getNotes() {
    if (!fs.existsSync(notesPath)) return {};
    return JSON.parse(fs.readFileSync(notesPath, 'utf8'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Show a user\'s full moderation history.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to show history for')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const guildId = interaction.guild.id;
        // Warns
        const warns = getWarns();
        const userWarns = (warns[guildId] && warns[guildId][user.id]) || [];
        // Notes
        const notes = getNotes();
        const userNotes = (notes[guildId] && notes[guildId][user.id]) || [];
        // Compose embed
        const embed = new EmbedBuilder()
            .setTitle(`📜 Moderation History for ${user.tag}`)
            .setColor(0x3498db)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Warnings', value: userWarns.length > 0 ? userWarns.map((w, i) => `**${i+1}.** ${w.reason} _(by ${w.moderator}, <t:${Math.floor(new Date(w.date).getTime()/1000)}:R>)_`).join('\n') : 'None', inline: false },
                { name: 'Notes', value: userNotes.length > 0 ? userNotes.map((n, i) => `**${i+1}.** ${n.note} _(by ${n.moderator}, <t:${Math.floor(new Date(n.date).getTime()/1000)}:R>)_`).join('\n') : 'None', inline: false }
            )
            .setFooter({ text: `Warns: ${userWarns.length} | Notes: ${userNotes.length}` });
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 