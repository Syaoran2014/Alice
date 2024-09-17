const { EmbedBuilder, PermissionsBitField } = require("discord.js");

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

        this.util.bot.on(this.util.lib.Events.GuildMemberRemove, async (guildMember) => {
            if(guildMember.user.bot || !guildMember.guild) return; 

            const guildInfo = await this.getGuildConfig(guildMember.guild.id);
            if(!guildInfo.LogEnabled) return; 

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;

            const embed = {
                color: parseInt("fe3232", 16), 
                author: {
                    name: guildMember.user.username,
                    icon_url: guildMember.user.avatarURL(),
                },
                description: `${guildMember} has left the server.`,
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

        this.util.bot.on(this.util.lib.Events.ChannelCreate, async (channel) => {
            if (channel.type == 1) return;
            const guildInfo = await this.getGuildConfig(channel.guild.id);
            if(!guildInfo.LogEnabled) return; 
            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;

            let type;

            switch (channel.type) {
                case 0:
                    type = 'Text Channel'
                    break;
                case 2:
                    type = 'Voice Channel'
                    break;
                case 5:
                    type = 'Announcement Channel'
                    break;
                case 15:
                    type = 'Forum Channel'
                    break;
                default:
                    type = 'Channel or Category'
            }

            const embed = {
                color: parseInt("7feb7f", 16),
                title: 'New Channel Created',
                description: `${type} ${channel.name} was created => ${channel}`,
            };

            loggingChannel.send({ embeds: [embed] });
        });

        this.util.bot.on(this.util.lib.Events.ChannelUpdate, async (oldChannel, newChannel) => {
            if (oldChannel.type == 1) return;
            const guildInfo = await this.getGuildConfig(newChannel.guild.id);
            if(!guildInfo.LogEnabled) return; 
            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;
            
            const embed = {
                color: parseInt("f0ccc0", 16),
                title: 'Channel Updated',
                fields: [],
            };

            if (oldChannel.name !== newChannel.name) {
                embed.description = `Name Changed:\nOld Name: ${oldChannel.name}\nNew Name: ${newChannel.name}`;
            }

            const newPerms = newChannel.permissionOverwrites.cache;
            const oldPerms = oldChannel.permissionOverwrites.cache;

            const oldOverwritesMap = new Map(oldPerms.map(o => [o.id, o]));
            const newOverwritesMap = new Map(newPerms.map(o => [o.id, o]));

            const allIds = new Set([...oldOverwritesMap.keys(), ...newOverwritesMap.keys()]);

            for(const id of allIds) {
                const oldPerm = oldOverwritesMap.get(id);
                const newPerm = newOverwritesMap.get(id);

                util.logger.debug(`${JSON.stringify(oldPerm)} --- ${JSON.stringify(newPerm)}`);

                if(!oldPerm) {
                    const targ = getOverwriteTarget(newPerm, newChannel.guild); 
                    const allowed = newPerm.allow.toArray().join(', ') || 'None';
                    const denied = newPerm.deny.toArray().join(', ') || 'None';
                    let value = `Permission Added for ${targ}\n`;
                    value += `Allowed Permissions: ${allowed}\nDenied Permissions: ${denied}\n`;
                    embed.fields.push({ name: 'Permission Added', value: value });
                } else if (!newPerm) {
                    const targ = getOverwriteTarget(oldPerm, oldChannel.guild);
                    embed.fields.push ({ name: 'Permission Removed', value: `Permission removed for ${targ}` });
                } else {
                    const oldAllow = oldPerm.allow;
                    const newAllow = newPerm.allow;
                    const oldDeny = oldPerm.deny;
                    const newDeny = newPerm.deny;

                    const addedAllow = new PermissionsBitField(newAllow.bitfield & ~oldAllow.bitfield);
                    const removedAllow = new PermissionsBitField(oldAllow.bitfield & ~newAllow.bitfield);
                    const addedDeny = new PermissionsBitField(newDeny.bitfield & ~oldDeny.bitfield);
                    const removedDeny = new PermissionsBitField(oldDeny.bitfield & ~newDeny.bitfield);

                    const changes = [];

                    if (addedAllow.bitfield !== 0n) {
                        changes.push(`Permissions **allowed**: ${addedAllow.toArray().join(', ')}`);
                    }
                    if (removedAllow.bitfield !== 0n) {
                        changes.push(`Permissions **no longer allowed**: ${removedAllow.toArray().join(', ')}`);
                    }
                    if (addedDeny.bitfield !== 0n) {
                        changes.push(`Permissions **denied**: ${addedDeny.toArray().join(', ')}`);
                    }
                    if (removedDeny.bitfield !== 0n) {
                        changes.push(`Permissions **no longer denied**: ${removedDeny.toArray().join(', ')}`);
                    }

                    if (changes.length > 0) {
                        const target = getOverwriteTarget(newPerm, newChannel.guild);
                        embed.fields.push({ name: `Permission Updated for ${target}`, value: changes.join('\n') });
                    }
                }
            }

            switch (oldChannel.type) {
                case 0:
                    if (oldChannel.topic !== newChannel.topic) {
                        embed.fields.push({ name: "Topic Updated", value: `Old: ${oldChannel.topic}\nNew: ${newChannel.topic}`});
                    }
                    //type = 'Text Channel'
                    break;
                case 2:
                    //type = 'Voice Channel'
                    break;
                case 5:
                    //type = 'Announcement Channel'
                    break;
                case 15:
                    if (oldChannel.topic !== newChannel.topic) {
                        embed.fields.push({ name: "Topic Updated", value: `Old: ${oldChannel.topic}\nNew: ${newChannel.topic}`});
                    }
                    //type = 'Forum Channel'
                    break;
                default:
                    //type = 'Channel or Category'
            }

            loggingChannel.send({ embeds: [embed] }); 
                           

        });

        this.util.bot.on(this.util.lib.Events.ChannelDelete, async (channel) => {
            if (channel.type == 1) return;
            const guildInfo = await this.getGuildConfig(channel.guild.id);
            if(!guildInfo.LogEnabled) return; 
            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;
            let type;

            switch (channel.type) {
                case 0:
                    type = 'Text Channel'
                    break;
                case 2:
                    type = 'Voice Channel'
                    break;
                case 5:
                    type = 'Announcement Channel'
                    break;
                case 15:
                    type = 'Forum Channel'
                    break;
                default:
                    type = 'Channel or Category'
            }

            const embed = {
                color: parseInt("ff3232", 16),
                title: 'Channel Deleted',
                description: `${type} ${channel.name} was deleted`,
            };

            loggingChannel.send({ embeds: [embed] });
        });

        this.util.bot.on(this.util.lib.Events.GuildAuditLogEntryCreate, async (auditLog, guild) => {
            const guildInfo = await this.getGuildConfig(guild.id);
            if(!guildInfo.LogEnabled) return;

            const loggingChannel = this.util.bot.channels.cache.get(guildInfo.LogChannel);
            if(!loggingChannel) return;
            
            const embed = new EmbedBuilder()
                .setTitle(`New Audit Log Entry Created`)
                .setColor(0xf0ccc0)
                .setTimestamp();

            // Making a tUser (target user) variable so I can assign later on supported actions.
            // If you attempt to assign on certain action, will crash the bot because targetId null.
            // There's probably a better way to do this, but I wasn't sure how....
            let tUser;

            //Make a switch case to switch auditLog.action, Map what Id goes to which API, ie. action 72 = message delete 
            switch(auditLog.action){
                case 20:
                    tUser = await this.util.bot.users.fetch(auditLog.targetId); 
                    embed.setDescription(`User ${tUser} was kicked`);
                    embed.setAuthor({ name: auditLog.executor.username, iconURL: auditLog.executor.avatarURL() });
                    if(auditLog.reason){
                        embed.addFields({ name: "With Reason", value: `${auditLog.reason}` });
                    }
                    loggingChannel.send({ embeds: [embed] });
                    break;
                case 22:
                    tUser = await this.util.bot.users.fetch(auditLog.targetId); 
                    embed.setDescription(`User ${tUser} was banned`);
                    embed.setAuthor({ name: auditLog.executor.username, iconURL: auditLog.executor.avatarURL() });
                    if(auditLog.reason){
                        embed.addFields({ name: "With Reason", value: `${auditLog.reason}` });
                    }
                    loggingChannel.send({ embeds: [embed] });
                    break;
                case 72:
                    tUser = await this.util.bot.users.fetch(auditLog.targetId); 
                    embed.setDescription(`Mod Deleted ${tUser} message`);
                    embed.setAuthor({ name: auditLog.executor.username, iconURL: auditLog.executor.avatarURL() });
                    loggingChannel.send({ embeds: [embed] });
                    break;
                default:
                    //Leaves anything I don't want unhandled
                    break;
            }
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

function getOverwriteTarget(overwrite, guild) {
    if (overwrite.type === 0) {
        const role = guild.roles.cache.get(overwrite.id);
        return role ? `Role: ${role.name}` : `Role ID: ${overwrite.id}`;
    } else if (overwrite.type === 1) {
        const member = guild.members.cache.get(overwrite.id);
        return member ? `Member: ${member.user.username}` : `Member ID: ${overwrite.id}`;
    } else {
        return `ID: ${overwrite.id}`;
    }
}


module.exports = LoggingService;
