const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    category: 'administration',
    data: new SlashCommandBuilder()
      .setName('kick')
      .setDescription('kicks a member.')
      .addUserOption((option) => option
          .setName('target')
          .setDescription("User to kick.")
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    execute: async function(interaction, util) {
        const userOption = interaction.options.getMember('target');
        userOption.kick();

        return interaction.reply({ content: `${userOption} has been kicked.` });
    }, 
    callback: async function(msg, args, utl) {}, 
};
