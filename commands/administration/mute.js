const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    category: 'administration',
    data: new SlashCommandBuilder()
      .setName('mute')
      .setDescription('Mutes a user')
      .addUserOption(option => option
          .setName('target')
          .setDescription('User you want to mute')
          .setRequired(true))
      .addNumberOption(option => option
          .setName('duration')
          .setDescription('Length in Minutes to timeout a user')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.TimeoutMembers),
    execute: async function(interaction, util) {
        const user = interaction.options.getMember('target');
        const durationAmount = interaction.options.getNumber('duration');
        const duration = durationAmount * 60 * 1000;

        user.timeout(duration);
        return interaction.reply({ content: `${user} has been timed out for ${durationAmount} minutes` });

    },
    callback: async function(msg, args, util) {}
};

