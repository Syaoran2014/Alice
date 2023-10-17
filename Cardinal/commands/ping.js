const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong! and Latency time."),
  execute: async function (interaction, args, util) {
    const sent = await interaction.reply({
      content: "Pong!",
      fetchReply: true,
    });
    await interaction.editReply(
      `Pong! ${sent.createdTimestamp - interaction.createdTimestamp}ms`
    );
  },
  callback: async function (msg, args, util) {
    msg.channel.send("pong!").then((res) => {
      let ping = res.createdTimestamp - msg.createdTimestamp;
      res.channel.send(`Pong! ${ping}ms`);
      res.delete(0);
    });
  },
};
