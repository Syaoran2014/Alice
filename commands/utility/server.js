const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server"),
  async execute(interaction) {
    await interaction.reply(
      `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
    );
  },
  async callback(msg, args, util) {
    msg.channel.send(
      `This server is ${msg.guild.name} and has ${msg.guild.memberCount} members.`
    );
  },
};
