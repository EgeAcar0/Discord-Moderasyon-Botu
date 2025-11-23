const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk delete messages in a channel.')
        .addStringOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100 or "all")')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const amountRaw = interaction.options.getString('amount');
        const user = interaction.options.getUser('user');
        let amount = 0;
        if (amountRaw.toLowerCase() === 'all') {
            amount = 100;
        } else {
            amount = parseInt(amountRaw, 10);
            if (isNaN(amount) || amount < 1 || amount > 100) {
                return interaction.reply({ content: '❌ Amount must be between 1 and 100, or "all".', ephemeral: true });
            }
        }
        const channel = interaction.channel;
        let deleted;
        if (user) {
            const messages = await channel.messages.fetch({ limit: 100 });
            const toDelete = messages.filter(m => m.author.id === user.id).first(amount);
            deleted = await channel.bulkDelete(toDelete, true).catch(() => null);
        } else {
            deleted = await channel.bulkDelete(amount, true).catch(() => null);
        }
        if (!deleted) {
            return interaction.reply({ content: '❌ Failed to delete messages. Messages older than 14 days cannot be deleted.', ephemeral: true });
        }
        await interaction.reply({ content: `🧹 Deleted ${deleted.size} messages.`, ephemeral: true });
    },
}; 