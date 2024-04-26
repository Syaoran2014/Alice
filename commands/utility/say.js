const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
      .setName('say')
      .setDescription('Echos what a user sends, if given JSON will instead send an embed.')
      .addStringOption(option => option 
          .setName('content')
          .setDescription('The text or JSON to send.')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async function(interaction, util) { 
        const content = interaction.options.getString('content');

        try {
            const embedData = JSON.parse(content);
            const embed = new EmbedBuilder(embedData);
            
            await interaction.channel.send({ embeds: [embed] });
            return interaction.reply({ content: `Message Sent!`, ephemeral: true });
        } catch (error) {
            if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
                await interaction.reply({ content: `The provided JSON was not valid: ${error.message}`, ephemeral: true });
            } else {
                await interaction.channel.send({ content: content });
                return interaction.reply({ content: `Message Sent!`, ephemeral: true });
            }
        }
    },
    callback: async function(msg, args, util) {},
};
