class LoggingService {
    constructor(util) {
        this.util = util;
        this.cache = {}; 

        this.util.bot.on(this.util.lib.Events.MessageDelete, async (message) => {
            if (message.author.bot || !message.guild) return;

            const guildInfo = await this.getGuildConfig(message.guildId);
            if(!guildInfo.LogEnabled) return;

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;

            const embed = {
                color: parseInt("f0ccc0", 16),
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL(),
                },
                title: `Message Deleted in ${message.channel}`,
                description: `***Content:*** ${message.content}`,
            };

            loggingChannel.send({ embeds: [embed] });

            // this.util.dataHandler.getGuildConfig(message.guildId, (err, guildInfo) => {
                //     if (err) {
                    //         this.util.logger.error(err.message);
                    //         return;
                    //     }

                //     if (!guildInfo.LogEnabled) {
                    //         return;
                    //     }

                //     const loggingChannel = this.util.bot.channels.cache.get(
                    //         guildInfo.LogChannel
                    //     );

                //     const embed = {
                    //         color: parseInt("f0ccc0", 16),
                    //         author: {
                        //             name: message.author.username,
                        //             icon_url: message.author.avatarURL(),
                        //         },
                    //         title: `Message Deleted in ${message.channel}`,
                    //         description: `***Content:*** ${message.content}`,
                    //     };

                //     loggingChannel.send({ embeds: [embed] });
                // });
        });

        this.util.bot.on(this.util.lib.Events.MessageUpdate, async (oldMessage, newMessage) => {
            if (oldMessage.author.bot || !oldMessage.guild) return;

            if (oldMessage.content === newMessage.content) return;

            const guildInfo = await this.getGuildConfig(oldMessage.guildId); 
            if(!guildInfo.LogEnabled) return;

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return; 

            const embed = {
                color: parseInt("f0ccc0", 16),
                author: {
                    name: newMessage.author.username,
                    icon_url: newMessage.author.avatarURL(),
                },
                title: `Message edited in ${newMessage.channel}`,
                description: `***Old Message:*** ${oldMessage.content} \n ***New Message:*** ${newMessage.content}`,
            };

            loggingChannel.send({ embeds: [embed] });

            // this.util.dataHandler.getGuildConfig(
                //     oldMessage.guildId,
                //     (err, guildInfo) => {
                    //         if (err) {
                        //             this.util.logger.error(err.message);
                        //             return;
                        //         }

                    //         if (!guildInfo.LogEnabled) {
                        //             return;
                        //         }

                    //         const loggingChannel = this.util.bot.channels.cache.get(
                        //             guildInfo.LogChannel
                        //         );

                    //         const embed = {
                        //             color: parseInt("f0ccc0", 16),
                        //             author: {
                            //                 name: newMessage.author.username,
                            //                 icon_url: newMessage.author.avatarURL(),
                            //             },
                        //             title: `Message edited in ${newMessage.channel}`,
                        //             description: `***Old Message:*** ${oldMessage.content} \n ***New Message:*** ${newMessage.content}`,
                        //         };

                    //         loggingChannel.send({ embeds: [embed] });
                    //     }
                // );
        });

        this.util.bot.on(this.util.lib.Events.VoiceStateUpdate, async (oldState, newState) => {
            if(oldState.member.bot || !oldState.guild) return;

            const guildInfo = await this.getGuildConfig(oldState.guild.id);
            if(!guildInfo.LogEnabled) return;

            // Remove this line if I want to listen to other voice events.
                if(oldState.channelId == newState.channelId) return;

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel); 
            if(!loggingChannel) return;

            if(newState.channel == null){
                const embed = {
                    color: parseInt("ff3232", 16),
                    author: {
                        name: newState.member.user.username,
                        icon_url: newState.member.user.avatarURL(),
                    },
                    description: `${oldState.member} left voice channel: ${oldState.channel}`
                };

                loggingChannel.send({ embeds: [embed]} );
            } else {
                const embed = {
                    color: parseInt("7FEB7F", 16),
                    author: {
                        name: newState.member.user.username,
                        icon_url: newState.member.user.avatarURL(),
                    },
                    description: `${newState.member} has joined voice channel: ${newState.channel}`
                };

                loggingChannel.send({ embeds: [embed]} );
            }
        });

        this.util.bot.on(this.util.lib.Events.GuildMemberUpdate, async (oldMember, newMember) => {
            util.logger.log(oldMember);
            util.logger.log(newMember);
            if(oldMember.user.bot || !oldMember.guild) return;

            const guildInfo = await this.getGuildConfig(oldMember.guild.id);
            if(!guildInfo.LogEnabled) return;

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;

            const embed = {
                color: parseInt("f0ccc0", 16),
                author: {
                    name: newMember.user.username,
                    icon_url: newMember.user.avatarURL(),
                }
            };

            //Checks for DisplayName Update
            if(oldMember.displayName != newMember.displayName) {
                embed.title = `Display Name updated:`;
                embed.description = `***Old Name:*** ${oldMember.displayName} \n ***New Name:*** ${newMember.displayName}`;

                loggingChannel.send({ embeds: [embed] });
            }

            //Checking Roles and Role related variables
            if(oldMember.roles != newMember.roles) { 
                //util.logger.log(JSON.stringify(oldMember.roles));
                const oldRoles = oldMember.roles.cache;
                const newRoles = newMember.roles.cache;

                const addedRoles = newRoles.filter(x => !oldRoles.has(x.id));

                const removedRoles = oldRoles.filter(x => !newRoles.has(x.id));

                if(addedRoles.size > 0){
                    addedRoles.forEach(role => {
                        embed.title = `:white_check_mark: Role Added to User`;
                        embed.description = `${role.name}`;

                        loggingChannel.send({ embeds: [embed] });
                    });
                }

                if(removedRoles != null){
                    removedRoles.forEach(role => {
                        embed.title = `:x: Role removed from User`;
                        embed.description = `${role.name}`;

                        loggingChannel.send({ embeds: [embed] });            
                    });
                }
            }
        });

        this.util.bot.on(this.util.lib.Events.GuildMemberAdd, async (guildMember) => {
            if (guildMember.user.bot || !guildMember.guild) return;

            const guildInfo = await this.getGuildConfig(guildMember.guild.id); 
            if(!guildInfo.LogEnabled) return;

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;

            // get how long account has been made
            const accountCreation = guildMember.user.createdAt;
            const age = this.getAccountAge(accountCreation);
            const embed = {
                color: parseInt("7FEB7F", 16),
                author: {
                    name: guildMember.user.username,
                    icon_url: guildMember.user.avatarURL(),
                },
                description: `${guildMember} has joined the server!`,
                fields: [
                    {
                        name: 'Account age',
                        value: `${age}`,
                    },
                ],
            };

            loggingChannel.send({ embeds: [embed] });
        });

        this.util.bot.on(this.util.lib.Events.GuildEmojiCreate, async (guildEmoji) => {
            const guildInfo = await this.getGuildConfig(guildEmoji.guild.id);
            if(!guildInfo.LogEnabled) return; 

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;
            
            const embed = {
                color: parseInt("7FEB7F", 16),
                title: `Server Emoji's updated`,
                description: `Emoji Added! ${guildEmoji} ${guildEmoji.name}`,
            };

            loggingChannel.send({ embeds: [embed] });
        });


        this.util.bot.on(this.util.lib.Events.GuildEmojiDelete, async (guildEmoji) => {
            const guildInfo = await this.getGuildConfig(guildEmoji.guild.id);
            if(!guildInfo.LogEnabled) return; 

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;

            const embed = {
                color: parseInt("ff3232", 16),
                title: `Server Emoji's updated`,
                description: `Emoji Deleted: ${guildEmoji.name}`,
            };

            loggingChannel.send({ embeds: [embed] });
        });
        this.util.bot.on(this.util.lib.Events.GuildEmojiUpdate, async (oldEmoji, newEmoji) => {
            const guildInfo = await this.getGuildConfig(newEmoji.guild.id);
            if(!guildInfo.LogEnabled) return; 

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;

            const embed = {
                color: parseInt("f0ccc0", 16),
                title: `Server Emoji's updated`,
                description: `Emoji updated: ${newEmoji} ${oldEmoji.name} -> ${newEmoji.name}`,
            };

            loggingChannel.send({ embeds: [embed] });
        });
    }

    async getGuildConfig(guildId){
        // Checks the cache and updates every hour
        if(this.cache[guildId] && this.cache[guildId].timestamp > Date.now() - 1000 * 60 * 60) {
            return this.cache[guildId].data;
        }

        return new Promise((resolve, reject) => {
            this.util.dataHandler.getGuildConfig(guildId, (err, guildInfo) => {
                if(err) {
                    this.util.logger.error(err.message);
                    reject(err);
                    return;
                }

                this.cache[guildId] = {
                    data: guildInfo,
                    timestamp: Date.now()
                };
                resolve(guildInfo);
            }); 
        });
    }

    getAccountAge(accountDate) {
        const now = new Date();

        const totalDays = (now - accountDate) / (1000 * 60 * 60 * 24);

        const years = Math.floor(totalDays / 365.25);
        const months = Math.floor((totalDays % 365.25) / 30.44); 
        const days = Math.floor((totalDays % 365.25) % 30.44);

        if(years >= 1){ 
            return `${years} years ${months} months and ${days} days old.`;
        } else if (months >= 1) {
            return `${months} months and ${days} days old.`;
        } else {
            return `${days} days old.`;
        }
    }
}

module.exports = LoggingService;
