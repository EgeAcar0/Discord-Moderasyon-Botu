const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const fs = require('fs');
const path = require('path');
const notesPath = path.join(__dirname, '../../notes.json');

function getNotes() {
    if (!fs.existsSync(notesPath)) return {};
    return JSON.parse(fs.readFileSync(notesPath, 'utf8'));
}
function saveNotes(notes) {
    fs.writeFileSync(notesPath, JSON.stringify(notes, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('note')
        .setDescription('Add a private note for a user (visible only to moderators).')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add a note for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('note')
                .setDescription('Note content')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const note = interaction.options.getString('note');
        const notes = getNotes();
        const guildId = interaction.guild.id;
        const userId = user.id;
        notes[guildId] = notes[guildId] || {};
        notes[guildId][userId] = notes[guildId][userId] || [];
        notes[guildId][userId].push({
            moderator: interaction.user.tag,
            moderatorId: interaction.user.id,
            date: new Date().toISOString(),
            note
        });
        saveNotes(notes);
        await interaction.reply({ content: `📝 Note added for ${user.tag}.`, ephemeral: true });
    },
}; 