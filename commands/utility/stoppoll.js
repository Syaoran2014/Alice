const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { pollMap } = require('./poll');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('stoppoll')
        .setDescription('Stops an active poll')
        .addStringOption(option => option
            .setName('messageid')
            .setDescription('Message ID of the active poll to stop')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async function (interaction, util) {
        const messageID = interaction.options.getString('messageid');
        util.logger.log(JSON.stringify(pollMap)); 
        const pollData = pollMap.get(messageID);

        if(!pollData) {
            return interaction.reply({ content: 'No active poll found with provided message ID', ephemeral: true });
        }

        pollData.collector.stop();
        return interaction.reply({ content: 'Poll Stopped successfully', ephemeral: true });
    },
    callback: async function (msg, args, util) {}
};
