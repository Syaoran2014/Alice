const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, QueryType } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("Plays/Adds a song to the queue.")
      .addStringOption(option => 
        option
          .setName('song')
          .setDescription("Adds song to queue.")
          .setRequired(true)
        ),
    execute: async function(interaction, util) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        const song = interaction.options.getString('song', true);

        //Deferring the interaction to process the request.
        await interaction.deferReply();

        const res = await player.search(song, {
            requestedBy: interaction.member,
            searchEngine: QueryType.AUTO
        });
        const noResultsEmbed = {
            color: parseInt("2f3136", 16),
            title: "No results found... please try again!"
        }

        if(!res || !res.tracks.length) return interaction.followUp({ embeds: [noResultsEmbed]});
        
        const queue = await player.nodes.create(interaction.guild, {
            metadata: interaction.channel,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 30000,
            leaveOnEnd: true,
            leaveOnEndCooldown: 30000,
            volume: 50,
        });

        if(!channel) {
            return interaction.followUp({content: "You are not connected to a voice channel!"});
        }
        try {
            if(!queue.connection) await queue.connect(channel);
        } catch {
            await player.deleteQueue(interaction.guildId);

            const noVoiceEmbed = {
                title: "I'm unable to join the voice channel... Please try again!\n If issue persists, please contact bot owner",
                color: parseInt("2f3136", 16),
            };

            return interaction.followUp({ embeds: [noVoiceEmbed]})
        }

        const playEmbed = {
            title: `Loading your ${res.playlist? 'playlist' : 'track'} to the queue... ✅`,
            //description: `${res.tracks}`,
            color: parseInt("2f3136", 16),
        }


        await interaction.followUp({ embeds: [playEmbed]})

        res.playlist ? queue.addTrack(res.tracks): queue.addTrack(res.tracks[0]);

        if(!queue.isPlaying()) await queue.node.play();

        // try {
        //     const { track } = await player.play(channel, song, {
        //         nodeOptions: {
        //             //nodeOptions are the options for guild node (aka your queue in simple word)
        //             metadata: interaction // we can access this metadata objext using queue.metadata later
        //         }
        //     });
        //     return interaction.followUp(`**${track.title}** queued!`)
        // } catch (e) {
        //     return interaction.followUp(`Something went wrong: ${e}`);
        //}
    }
}