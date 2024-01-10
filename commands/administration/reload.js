const { SlashCommandBuilder, PermissionFlagsBits} = require("discord.js");

module.exports = {
    category: 'administration',
    data: new SlashCommandBuilder()
      .setName('reload')
      .setDescription('Reloads a command.')
      .addStringOption(option => 
        option.setName('command')
        .setDescription('The command to reload.')
        .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async function (interaction, util) {
        const commandName = interaction.options.getString('command', true);
        const command = interaction.client.commands.get(commandName);
        if (!command) {
            return interaction.reply(`No command with that name exists... \`${commandName}\``);
        }

        delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`../${command.category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply((`Command \`${newCommand.data.name}\` was reloaded!`));
        } catch (error) {
            util.logger.error(error);
            await interaction.reply(`There was an error while reloading the command \`${command.data.name}\`: \n\`${error.message}\``);
        }
    },
};