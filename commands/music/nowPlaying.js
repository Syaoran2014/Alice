const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    category: 'music',
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

        //util.logger.log(JSON.stringify(track, null, 4));
        //Update to be a console.
        const embed = {
            color: parseInt("f0ccc0", 16),
            thumbnail: {
               // url: interaction.guild.iconURL({ size: 2048, dynamic: true})
                url: track.thumbnail
            },
            author: {
                name: `Now Playing:`,
                icon_url: util.bot.user.displayAvatarURL({ size: 1024, dynamic: true}),
            },
            description: `**Title:** ${track.title}\n **Artist:** ${track.author}`,
            fields: [
                {
                    name: 'Requested by:',
                    value: `${track.requestedBy}`,
                    inline: true,
                },
                {
                    name: 'Duration:',
                    value: `${track.duration}`,
                    inline: true,
                },
            ],
            image: {
                url: `https://media1.tenor.com/images/b3b66ace65470cba241193b62366dfee/tenor.gif`
            }
        };

        interaction.reply({ embeds: [embed]});
    }
};