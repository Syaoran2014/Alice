const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    category: 'administration',
    data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Bans a member.')
      .addUserOption((option) => option
          .setName('target')
          .setDescription("User to ban.")
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    execute: async function(interaction, util) {
        const userOption = interaction.options.getUser('target');
        const guild = interaction.guild;
        guild.members.ban(userOption);

        return interaction.reply({ content: `${userOption} has been Banned` });
    }, 
    callback: async function(msg, args, utl) {}, 
};
