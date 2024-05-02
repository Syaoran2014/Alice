class guildJoin { 
    constructor(util){
        this.util = util; 
        
        this.util.bot.on(this.util.lib.Events.GuildMemberAdd, async (member) => {
            if (member.user.bot) return; 
            
            this.util.dataHandler.getGuildConfig(member.guild.id, async (err, guildInfo) => {
                if (err) {
                    this.util.logger.error(err.message);
                    return;
                }

                if(!guildInfo.AutoRoleEnabled) return;

                if(!guildInfo.AutoRole) return; 

                const autoRole = member.guild.roles.cache.find( r => r.id == guildInfo.AutoRole);
                try {
                    await member.roles.add(autoRole);
                } catch (error) {
                    if(guildInfo.LogChannel){
                        const logChannel = util.bot.channels.cache.get(guildInfo.LogChannel);
                        logChannel.send({ content: `Error assigning autorole to ${member.user.username} with this error:\n${error.message}.`});
                    }
                    util.logger.error(error.message); 
                }
            });
        });
    }
}

module.exports = guildJoin;