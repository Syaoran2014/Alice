const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setdj")
    .setDescription("Command used to set a DJ role.")
    .addRoleOption(option => 
        option
          .setName("role")
          .setDescription("Role to set as the DJ role.")
          .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async function (interaction, util) {
        const djRole = interaction.options.getRole('role');
        const cServer = interaction.guildId;
        if(!djRole) {
            return interaction.reply({ content: "You must specify a role for logging!"});
        }
        util.dataHandler.getDatabase().run("UPDATE ServerConfig SET DjRole = ? WHERE GuildId = ?",
        [djRole.id, cServer]);
        return interaction.reply({ content: `Dj Role has been set to ${djRole} for the ${interaction.guild} server!`});
    },

    callback: async function (msg, args, util) {},
};
