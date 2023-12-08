const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Responds with list of available commands."),
  execute: async function (interaction, util) {
    const helpCommand = [];
    util.commandHandler.sCommands.forEach((command) => {
      let commandName = command.name.toString();
      let capCommandName = commandName.charAt(0).toUpperCase() + commandName.slice(1);
      let commandJson = {
        name: capCommandName,
        value: command.description.toString(),
      };
      helpCommand.push(commandJson);
    });
    const embed = {
      color: parseInt("f0ccc0", 16),
      title: "Command Help",
      description: "List of commands currently registered by the bot",
      fields: helpCommand,
    };
    await interaction.reply({
      embeds: [embed],
    });
  },
  callback: async function (msg, args, util) {
    const helpCommand = [];
    util.commandHandler.sCommands.forEach((command) => {
      let commandName = command.name.toString();
      let capCommandName = commandName.charAt(0).toUpperCase() + commandName.slice(1);
      let commandJson = {
        name: capCommandName,
        value: command.description.toString(),
      };
      helpCommand.push(commandJson);
    });
    const embed = {
      color: parseInt("f0ccc0", 16),
      title: "Command Help",
      description: "List of commands currently registered by the bot",
      fields: helpCommand,
    };
    msg.channel.send({ embeds: [embed] });
  },
};
