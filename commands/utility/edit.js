const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js"); 

module.exports = {
    category: 'utility', 
    data: new SlashCommandBuilder()
      .setName('edit')
      .setDescription('Edits a message sent by the bot.')
      .addStringOption(option => option
          .setName('messageid')
          .setDescription('The ID of the message to edit.')
          .setRequired(true))
      .addStringOption(option => option
          .setName('content')
          .setDescription('The new text or JSON to edit the message to')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async function(interaction, util) {
        const messageId = interaction.options.getString('messageid');
        const newContent = interaction.options.getString('content');

        try {
            const message = await interaction.channel.messages.fetch(messageId);

            if (message.author.id !== interaction.client.user.id) {
                return interaction.reply({ content: `Sorry! I can only edit messages I sent.`, ephemeral: true });
            }

            try {
                const embedData = JSON.parse(newContent);
                const embed = new EmbedBuilder(embedData);

                await message.edit({ embeds: [embed] });
            } catch (error) {
                if( newContent.trim().startsWith('{') && newContent.trim().endsWith('}')) {
                    await interaction.reply({ content: `The provided JSON was invalid: ${error.message}`, ephemeral: true });
                } else {
                    await message.edit({ content: newContent });
                }
            }

            return interaction.reply({ content: `Message Sent!`, ephemeral: true });
        } catch (error) {
            return interaction.reply({ content: `Failed to edit the message: ${error.message}`, ephemeral: true });
        }
    },
    callback: async function(msg, args, util) {},
};
