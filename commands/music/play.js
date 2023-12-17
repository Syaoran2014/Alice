const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, QueryType } = require('discord-player');

const userSearchStatus = new Map();

module.exports = {
    category: 'music',
    userSearchStatus,
    data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("Plays/Adds a song to the queue.")
      .addStringOption(option => 
        option
          .setName('song')
          .setDescription("Adds song to queue.")
          .setRequired(true)
        )
      .addStringOption(option => 
        option
          .setName("platform")
          .setDescription("Platform to search your music on. Default Youtube")
          .setRequired(false)
          .addChoices(
            { name: 'Spotify', value: "SPOTIFY_SEARCH"},
            { name: 'Youtube', value: "YOUTUBE"},
            { name: 'Apple Music', value: 'APPLE_MUSIC_SEARCH'},
            { name: 'SoundCloud', value: 'SOUNDCLOUD'}
          )
        ),
    execute: async function(interaction, util) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        const song = interaction.options.getString('song', true);
        const setPlatform = interaction.options.getString('platform');
        var platform = null; 
        if (setPlatform){
            platform = setPlatform;
        }

        if (userSearchStatus.has(interaction.user.id)) {
            return interaction.reply({ content: `Please complete your last search first before starting a new one!`, ephemeral: true});
        }

        userSearchStatus.set(interaction.user.id, true);
        //Deferring the interaction to process the request.
        await interaction.deferReply();

        if(!channel) {
            return interaction.followUp({content: "You are not connected to a voice channel!"});
        }

        const noResultsEmbed = {
            color: parseInt("2f3136", 16),
            title: "No results found... please try again!"
        };
        const noVoiceEmbed = {
            title: "I'm unable to join the voice channel... Please try again!\n If issue persists, please contact bot owner",
            color: parseInt("2f3136", 16),
        };

        //Checking If const song is a Link
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

        if (urlPattern.test(song)) {
            const link = song; 
            const res = await player.search(link, {
                requestedBy: interaction.member,
                searchEngine: QueryType.AUTO
            });

            if(!res || !res.tracks.length) {
                return interaction.followUp({ embeds: [noResultsEmbed]});
            }
            
            const queue = await player.nodes.create(interaction.guild, {
                metadata: interaction.channel,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 60000,
                leaveOnEnd: true,
                leaveOnEndCooldown: 60000,
                volume: 5, //Update to 50... Maybe leave at 5?? It sounds fine....
            });
    
            try {
                if(!queue.connection) await queue.connect(channel);
            } catch {
                await player.deleteQueue(interaction.guildId);
    
                return interaction.followUp({ embeds: [noVoiceEmbed]});
            }
        
            const playEmbed = {
                title: `Loading your ${res.playlist? 'playlist' : 'track'} to the queue... ✅`,
                description: `${res.tracks[0]}`,
                color: parseInt("f0ccc0", 16),
            };
    
            await interaction.followUp({ embeds: [playEmbed]});
            userSearchStatus.delete(interaction.user.id);

            res.playlist ? queue.addTrack(res.tracks) : queue.addTrack(res.tracks[0]);
            //Update to catch and emit the playerStart 
            if(!queue.isPlaying()) await queue.node.play();
 
        } else {
            const query = song; 
            const res = await player.search(query, {
                requestedBy: interaction.member,
                searchEngine: platform ? QueryType.platform : QueryType.SPOTIFY_SEARCH
            });

            if(!res || !res.tracks.length) {
                return interaction.followUp({ embeds: [noResultsEmbed]});
            }

            const queue = await player.nodes.create(interaction.guild, {
                metadata: interaction.channel,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 30000,
                leaveOnEnd: true,
                leaveOnEndCooldown: 30000,
                volume: 5, //Update to 50... Maybe leave at 5?? It sounds fine....
            });

            try {
                if(!queue.connection) await queue.connect(channel);
            } catch {
                await player.deleteQueue(interaction.guildId);
    
                return interaction.followUp({ embeds: [noVoiceEmbed]});
            }

            const firstFiveTracks = res.tracks.slice(0, 5);

            const trackListEmbed = {
                color: parseInt("f0ccc0", 16),
                title: "Choose a track to play:",
                fields: [],
            };

            firstFiveTracks.forEach((track, index) => {
                trackListEmbed.fields.push({
                    name: `${index + 1}. ${track.title}`,
                    value: `Artist: ${track.author}`,
                });
            });
            trackListEmbed.fields.push({
                name: `\u200B`,
                value: `To cancel the selection reply with 'x'`,
            });

            await interaction.followUp({ embeds: [trackListEmbed]});

            const filter = (response) => {
                const userResponse = response.content;
                return (
                    ((!isNaN(userResponse) && userResponse >= 1 && userResponse <= 5) || 
                    (userResponse.toLowerCase() === 'x')) && 
                    response.author.id === interaction.user.id
                );
            };

            interaction.client.currentSearch = interaction;

            interaction.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] }).then((collected) => {
                const userChoice = Number(collected.first().content);
                const selectedTrack = firstFiveTracks[userChoice - 1];

                userSearchStatus.delete(interaction.user.id);
                if (userChoice != 'x') {
                    queue.addTrack(res.tracks[userChoice - 1]);

                    const selectedEmbed = {
                        title: `Loading the selected track to the queue... ✅`,
                        description: `${selectedTrack.title} by ${selectedTrack.author}`,
                        color: parseInt("f0ccc0", 16),
                    };
                    interaction.editReply({ embeds: [selectedEmbed]});

                    //Update to catch and emit the playerStart 
                    if(!queue.isPlaying()) queue.node.play();
                }
            }).catch((err) => {
                const cancelledSearch = {
                    description: `Search cancelled or aborted due to time out or user request.`,
                    color: parseInt("f0ccc0", 16),
                };
                userSearchStatus.delete(interaction.user.id);
                interaction.editReply({ embeds: [cancelledSearch]});
            });
        }
    }
};
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