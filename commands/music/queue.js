const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
      .setName("queue")
      .setDescription("Shows current song queue."),
    execute: async function(interaction, util) {
        const queue = useQueue(interaction.guild);
        if(!queue) {
            return interaction.reply({ content: "No music is currently in queue.", ephemeral: true});
        }

        if(!queue.tracks.toArray()[0]) {
            return interaction.reply({ content: "The final song is playing, queue up now to keep to party going!", ephemeral: true});
        }

        const songs = queue.tracks.size;
        const nextSonges = songs > 5 ? `And **${songs -5}** other song(s)...` : `In the playlist **${songs} song(s)...`;
        const tracks = queue.tracks.map((track, i) => `**${i + 1 }** - ${track.title} | ${track.author} (requested by : ${track.requestedBy.username})`);

        const emebed = {
            color: parseInt("f0ccc0", 16),
            thumbnail: {
                url: interaction.guild.iconURL({ size: 2048, dynamic: true})
            },
            author: {
                name: `Server queue - ${interaction.guild.name}`,
                icon_url: util.bot.user.displayAvatarURL({ size: 1024, dynamic: true}),
            },
            description: `Current ${queue.currentTrack.title}\n\n${tracks.slice(0, 5).join('\n')}\n\n${nextSonges}`,
            timestamp: new Date().toISOString(),
        };

        interaction.reply({ embeds: [emebed]});
    }
};