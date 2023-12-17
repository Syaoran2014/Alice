const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Stops the track"),
    execute: async function(interaction, util) {
        const queue = useQueue(interaction.guild);
        //const channel = interaction.member.voice.channel;
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
                const djRole = guildInfo.DjRole;
    
                const hasDjRole = member.roles.cache.has(djRole);
                const isAdmin = member.permissions.toArray().includes("Administrator");
                //util.logger.log(member.permissions.toArray())
                if (isAdmin || hasDjRole){
                    queue.delete();

                    const stopEmbed = {
                        title: "Music stopped, see you next time! \n(*^ ‿ <*)♡",
                        color: parseInt("f0ccc0", 16),
                    };
                    

                    return interaction.reply({ embeds: [stopEmbed]});
                }
            }
        });
    },
};