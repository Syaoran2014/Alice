const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips current track."),
   execute: async function (interaction, util) {
    const queue = useQueue(interaction.guild);
    const channel = interaction.member.voice.channel;
    const member = interaction.member; 

    if(!queue || !queue.isPlaying()) {
        return interaction.reply({content: `No music is currently playing`, ephemeral: true });
    }
    
    util.dataHandler.getGuildConfig(interaction.guildId, (err, guildInfo) => {
        if (err){
            util.logger.error(err.message);
            return interaction.reply({ content: "Sorry! Something didn't process right, try again later.\nIf issue persists, Contact Bot Owner."});
        }
        if(!guildInfo){
            return interaction.reply({ content: "No Server Info found, Please try again later."});
        } else {
            const djRole = guildInfo.djRole;

            const hasDjRole = member.roles.cache.has(djRole);
            const isAdmin = member.permissions.toArray().includes("Administrator");
            //util.logger.log(member.permissions.toArray())
            if (isAdmin || hasDjRole){
                const success = queue.node.skip();
                const skippedEmbed = {
                    title: success ? `Current track ${queue.currentTrack.title} has been skipped` : `Something went wrong, please try again`,
                    color: parseInt("f0ccc0", 16),
                };
                return interaction.reply({ embeds: [skippedEmbed]});
            } else {
                if (!channel){
                    return interaction.reply({ content: "You are not connected to a voice channel!", ephemeral: true});
                }

                const voiceMembers = channel.members.filter((member) => !member.user.bot);
                const requiredVotes = Math.ceil(voiceMembers.size / 2);

                if(!queue.votes){
                    queue.votes = new Set();
                }

                if (queue.votes.has(member.id)) {
                    return interaction.reply({ content: "You have already voted to skip the track.", ephemeral: true,});
                }

                queue.votes.add(member.id);

                if(queue.votes.size >= requiredVotes) {
                    const success = queue.node.skip();
                    if (success) {
                        queue.votes.clear();
                    }
                    const skippedEmbed = {
                        title: success ? `Current track ${queue.currentTrack.title} has been skipped` : `Something went wrong, please try again`,
                        color: parseInt("f0ccc0", 16),
                    };
                    return interaction.reply({ embeds: [skippedEmbed]});
                } else {
                    return interaction.reply({
                        content: `Your vote to skip has been counted (${queue.votes.size}/${requiredVotes}).`,
                        ephemeral: true,
                    });
                }
            }
        }
    });
  },

  callback: async function (msg, args, util) {},
};
