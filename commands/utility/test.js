const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Command used for testing items in development."),
  execute: async function (interaction, util) {
    await interaction.reply({
      content: "Nothing in testing! Try again later (*^ ‿ <*)♡ ",
    });
  },

  callback: async function (msg, args, util) {},
};
