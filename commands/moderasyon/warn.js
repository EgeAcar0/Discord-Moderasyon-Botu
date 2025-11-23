const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const fs = require('fs');
const path = require('path');
const warnsPath = path.join(__dirname, '../../warns.json');

function getWarns() {
    if (!fs.existsSync(warnsPath)) return {};
    return JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
}

function saveWarns(warns) {
    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user and log the warning.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ User not found in the server.', ephemeral: true });
        }
        const warns = getWarns();
        const guildId = interaction.guild.id;
        const userId = user.id;
        warns[guildId] = warns[guildId] || {};
        warns[guildId][userId] = warns[guildId][userId] || [];
        const warnData = {
            moderator: interaction.user.tag,
            moderatorId: interaction.user.id,
            date: new Date().toISOString(),
            reason
        };
        warns[guildId][userId].push(warnData);
        saveWarns(warns);
        // DM user
        user.send(`⚠️ You have been warned in ${interaction.guild.name} for: ${reason}`).catch(() => {});
        await interaction.reply({ content: `✅ ${user.tag} has been warned. Reason: ${reason}\nTotal warns: ${warns[guildId][userId].length}`, ephemeral: true });
    },
}; 