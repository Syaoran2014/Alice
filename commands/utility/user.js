const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Provides information about the user."),
  async execute(interaction) {
    await interaction.reply(
      `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`
    );
  },
  async callback(msg, args, util) {
    msg.channel.send(
      `This command was run by ${msg.author.username}, who joined on ${msg.member.joinedAt}.`
    );
  },
};
