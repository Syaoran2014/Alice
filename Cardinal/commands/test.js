const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Command used for testing items in development."),
    // .addStringOption((option) =>
    //   option
    //     .setName("date")
    //     .setDescription("format: MM/DD/YYYY, MM/DD")
    //     .setRequired(true))
    // .addUserOption((option) => 
    //   option
    //     .setName('user')
    //     .setDescription("User to select")),
   execute: async function (interaction, util) {
  //   const date = interaction.options.getString('date');
  //   await interaction.reply(`You entered ${date}`);
    await interaction.reply({
      content: "Nothing in testing! Try again later (*^ ‿ <*)♡ ",
    });
  },

  callback: async function (msg, args, util) {},
};
