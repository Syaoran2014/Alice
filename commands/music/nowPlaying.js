const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
      .setName("nowplaying")
      .setDescription("Shows currently playing song"),
    execute: async function(interaction, util) {
        const queue = useQueue(interaction.guild);
        
        if(!queue) {
            return interaction.reply({ content: "No music is currently in queue.", ephemeral: true });
        }

        const track = queue.currentTrack;
        const progress = queue.node.createProgressBar();

        //Update to be a console.
        const embed = {
            color: parseInt("f0ccc0", 16),
            thumbnail: {
                url: interaction.guild.iconURL({ size: 2048, dynamic: true})
            },
            author: {
                name: `Now Playing:`,
                icon_url: util.bot.user.displayAvatarURL({ size: 1024, dynamic: true}),
            },
            description: `${track.title}\n ${progress}\n Requested by: ${track.requestedBy}`
        }

        interaction.reply({ embeds: [embed]});
    }
}