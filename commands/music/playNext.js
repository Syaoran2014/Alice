const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, useQueue, QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playnext")
    .setDescription("Forces song to play next in queue")
    .addStringOption(option => 
        option
          .setName('song')
          .setDescription("Adds song to queue.")
          .setRequired(true)
        ),
    execute: async function (interaction, util) {
        const player = useMainPlayer();
        const queue = useQueue(interaction.guild);
        await interaction.deferReply();

        if (!queue || !queue.isPlaying()){
            //If queue doesn't exist, go ahead and play instead of queue....
            return interaction.followUp(`Nothing is currently in queue, Please use /play instead!\n This will be added later! ☆～（ゝ。∂）`)
        }

        const song = interaction.options.getString('song');

        const res = await player.search(song, {
            requestedBy: interaction.member,
            searchEngine: QueryType.AUTO
        });

        if(!res || !res.tracks.length){
            return interaction.followUp({ content: `No results found, please try again!`, ephemeral: true});
        }

        if (res.playlist) {
            return interaction.followUp({ content: `This command does not support playlists!\n Please try again with a single song!`, ephemeral: true});
        }

        queue.insertTrack(res.tracks[0], 0);

        const nextSongAdded = {
            title: `${res.tracks[0]} has successfully been added to the front of the queue!`,
            color: parseInt("f0ccc0", 16),
        }

        await interaction.followUp({ embeds: [nextSongAdded]});
  },

  callback: async function (msg, args, util) {},
};
