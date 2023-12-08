const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, useQueue, QueryType } = require("discord-player");
const { userSearchStatus } = require(`./play`);

module.exports = {
    category: 'music',
  data: new SlashCommandBuilder()
    .setName("playnext")
    .setDescription("Forces song to play next in queue")
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
        )),
    execute: async function (interaction, util) {
        const player = useMainPlayer();
        const queue = useQueue(interaction.guild);
        const song = interaction.options.getString('song', true);
        const setPlatform = interaction.options.getString('platform');
        var platform = null; 
        if (setPlatform){
            platform = setPlatform;
        }

        if(userSearchStatus.has(interaction.user.id)){
            return interaction.reply({ content: `Please complete your last search first before starting a new one!`, ephemeral: true});
        }
        userSearchStatus.set(interaction.user.id, true);

        //Defer the interaction to process everything...
        await interaction.deferReply();

        if (!queue || !queue.isPlaying()){
            //If queue doesn't exist, go ahead and play instead of queue....
            return interaction.followUp(`Nothing is currently in queue, Please use /play instead!\n This feature will be added later! ☆～（ゝ。∂）`);
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

            if (res.playlist) {
                return interaction.followUp({ content: `This command does not support playlists!\n Please try again with a single song!`, ephemeral: true});
            }
            
            const queue = await player.nodes.create(interaction.guild, {
                metadata: interaction.channel,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 30000,
                leaveOnEnd: true,
                leaveOnEndCooldown: 30000,
                volume: 5, //Update to 50... Maybe leave at 5?? It sounds fine....
            });
            //Channel Not defined, Shouldn't ever cause an error do to needing to play to begin with....
            try {
                if(!queue.connection) await queue.connect(channel);
            } catch {
                await player.deleteQueue(interaction.guildId);
    
                return interaction.followUp({ embeds: [noVoiceEmbed]});
            }

            const nextSongAdded = {
                title: `Track was successfully added to the front of the queue... ✅`,
                description: `${res.tracks[0]}`,
                color: parseInt("f0ccc0", 16),
            };
    
            await interaction.followUp({ embeds: [nextSongAdded]});
    
            queue.insertTrack(res.tracks[0], 0);
            userSearchStatus.delete(interaction.user.id);

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
            //Same here with channel issue, should always be in a channel with this command.....
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
                    (userResponse.toLowerCase() === 'x'))&& 
                    response.author.id === interaction.user.id
                );
            };

            interaction.channel.awaitMessages({ filter, max: 1, time: 120000, errors: ['time'] }).then((collected) => {
                const userChoice = Number(collected.first().content);
                const selectedTrack = firstFiveTracks[userChoice - 1];

                queue.insertTrack(res.tracks[0], 0);
                userSearchStatus.delete(interaction.user.id);

                const selectedEmbed = {
                    title: `Track was successfully added to the front of the queue... ✅`,
                    description: `${selectedTrack.title} by ${selectedTrack.author}`,
                    color: parseInt("f0ccc0", 16),
                };
                interaction.editReply({ embeds: [selectedEmbed]});

                //Update to catch and emit the playerStart 
            }).catch((err) => {
                const cancelledSearch = {
                    description: `Search cancelled or aborted due to time out or user request.`,
                    color: parseInt("f0ccc0", 16),
                };
                userSearchStatus.delete(interaction.user.id);
                interaction.editReply({ embeds: [cancelledSearch]});
            });
        }
    },

  callback: async function (msg, args, util) {},
};
