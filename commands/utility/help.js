const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Responds with list of available commands."),
  execute: async function(interaction, util) {
    const commandList = Object.values(util.commandHandler.commands);

    const categories = new Set(commandList.map(cmd => cmd.category));
    const options = Array.from(categories).map(category => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category,
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select-category')
        .setPlaceholder('Select a Category')
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ content: 'Select a category to see its commands:', components: [row], ephemeral: true });

    const filter = (i) => i.customId === 'select-category' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
        const selectedCategory = i.values[0];
        const categoryCommands = commandList.filter(cmd => cmd.category === selectedCategory);

        const embed = new EmbedBuilder()
            .setColor('f0ccc0')
            .setTitle(`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`)
            .setDescription(categoryCommands.map(cmd => `**/${cmd.data.name}** - ${cmd.data.description}`).join('\n'))
            .setTimestamp();

        await i.update({ embeds: [embed], components: [] });
        collector.stop();
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            interaction.editReply({ content: 'Command selection timed out.', components: [] });
        }
    });
  },
  callback: async function (msg, args, util) {},
};
