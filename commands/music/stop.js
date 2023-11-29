const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Stops the track"),
    execute: async function(interaction, util) {
        const player = useMainPlayer()

        const queue = useQueue(interaction.guild);

        if(!queue || !queue.isPlaying()) return interaction.reply({content: `No music is currently playing`, ephemeral: true });

        queue.delete();

        const stopEmbed = {
            title: "Mudic stopped, see you next time! (*^ ‿ <*)♡",
            color: parseInt("f0ccc0", 16),
        }

        return interaction.reply({ embeds: [stopEmbed]});
    }
}