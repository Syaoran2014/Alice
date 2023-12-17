const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Command used to shuffle the music queue."),
   execute: async function (interaction, util) {
    const queue = useQueue(interaction.guild);
    
    if(!queue || !queue.isPlaying()) {
        return interaction.reply({content: `No music is currently playing`, ephemeral: true });
    }

    await queue.tracks.shuffle();

    const shuffleEmbed = {
        title: `Queue has shuffled ${queue.tracks.size} song(s)`,
        color: parseInt("f0ccc0", 16),
    };
    return interaction.reply({ embeds: [shuffleEmbed]});
  },

  callback: async function (msg, args, util) {},
};
