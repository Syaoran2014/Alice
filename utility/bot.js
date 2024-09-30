const { ActivityType } = require("discord.js");
const fs = require("fs"); 
const path = require("path");

class CardinalBot {
    constructor(util) {
        this.util = util;
        this.client = this.util.bot;
        this.cache = {};
        const expService = this.util.services.get('ExpService');
        const economyService = this.util.services.get('EconomyService');
        const antibotService = this.util.services.get('AntibotService');
            
        // Log in to Discord with client's token.
        this.client.login(util.config.token);

        // When the client is ready, run this code (only once)
        // We use 'c' for the event parameter to keep it seperate from the already defined 'client'
        this.client.once(util.lib.Events.ClientReady, async (c) => {
            this.util.logger.log(`Ready! Logged in as ${c.user.tag}`);
            let totalMembers = 0;
            for (const guild of c.guilds.cache.values()) {
                try {
                    await guild.members.fetch();
                    
                    const members = guild.memberCount;
                    totalMembers += members;
                } catch (error) {
                    this.util.logger.error(`Error fetching members in guild ${guild.name}`);
                }
            }
            c.user.setActivity(`with ${totalMembers} hearts! ❤`, { type: ActivityType.Playing });

            var config = this.loadConfig(path.join(__dirname, '../data/roleMenuConfig.json'));

            this.fetchRoleMenuMessages(c, config);
            this.setupReactionListeners(c, util);
        });

        this.client.on(this.util.lib.Events.GuildCreate, async (guild) => {
            this.util.dataHandler.getDatabase()
                .run(
                    "INSERT INTO ServerConfig (GuildId, LogEnabled, LogChannel, MutedRole, DisabledCmds) VALUES(?, ?, ?, ?, ?);",
                    [guild.id, null, null, null, "[]"],
                    (err) => {
                        this.util.logger.log(
                            `Set guild data for: ${guild.name} (${guild.id}) members: ${guild.memberCount}`
                        );
                        if (err) {
                            this.util.logger.error(err.message);
                            return;
                        }
                    }
                );
            this.util.commandHandler.serverRegistration(guild);
        });

        //Initialize both Command Handlers.
        //Generate Exp and Economy before command, Initialize if not exists.
        this.client.on(this.util.lib.Events.MessageCreate, async (message) => {
            if (message.author.bot) {
                return; 
            }
            if (message.channel.type == this.util.lib.ChannelType.DM) {
                this.util.logger.debug(JSON.stringify(message)); 
                const owner = await this.client.users.fetch(this.util.config.ownerId);
                const suggestion = {
                    color: 0xeeb1b1,
                    author: {
                        name: `${message.author.username} - ID: ${message.author.id}`,
                        icon_url: message.author.displayAvatarURL({size: 1024, dynamic: true}),
                    },
                    title: `New message received`, 
                    description: message.content,
                    fields: [],
                    footer: {
                        text: `${message.createdAt}`
                    },
                };

                if (message.attachments.size > 0) {
                    let i = 1;
                    message.attachments.forEach(attachment => {
                        suggestion.fields.push({ name: `Attachment ${i}`, value: attachment.url });
                        i++;
                    });
                }
                this.util.logger.debug(JSON.stringify(suggestion)); 

                return await owner.send({ embeds: [suggestion] });
            }

            if (message.attachments.size > 0) {
                uploadAttachments(message, this.util);
            }

            const guildConfig = await this.getGuildConfig(message.guild.id);
            if(guildConfig.Antibot) {
                antibotService.antibot(message);
            }

            const userExists = await this.checkUserData(message.author.id);
            if(userExists) {
                expService.generateExp(message.author);
                economyService.generateCurrency(message.author);
            } else {
                this.util.dataHandler.initializeUserInfo(message.author, message.guild.id);
            }

            if (message.content.startsWith(this.util.config.prefix)) {
                await this.util.commandHandler.handleCommand(message);
            }
        });

        this.client.on(this.util.lib.Events.InteractionCreate, async (interaction) => {
            const userExists = await this.checkUserData(interaction.user.id);
            if(userExists) {
                expService.generateExp(interaction.user);
                economyService.generateCurrency(interaction.user);
            } else {
                this.util.dataHandler.initializeUserInfo(interaction.user, interaction.guildId);
            }
            await this.util.commandHandler.handleInteraction(interaction);
        });
    }

        //Checks user data. I only care if exists or not.
        async checkUserData(user) {
            // Cacheing Bug, Ultimately I just need to FIX MY FUCKING DATAHANDLER
            // if(this.cache[user] && this.cache[user].timestamp > Date.now() - 1000 * 60 * 60){
            //     return this.cache[user].data;
            // }
            return new Promise((resolve, reject) => {
                this.util.dataHandler.getUserInfo(user, (err, userInfo) => {
                    if (err) {
                        reject(err);
                    } else {
                        // this.cache[user] = {
                        //     data: userInfo,
                        //     timestamp: Date.now()
                        // };
                        resolve(userInfo != null);
                    }
                });
            });
        }


    //How I am managing the Role Menu stuff.
        async fetchRoleMenuMessages(client, config) {
            for (const guildId in config) {
                const guild = await client.guilds.fetch(guildId);
                for (const channelId in config[guildId]){
                    const channel = await guild.channels.fetch(channelId);
                    for (const messageId of Object.keys(config[guildId][channelId])) {
                        try {
                            await channel.messages.fetch(messageId);
                        } catch (error) {
                            this.util.logger.error(`Error fetching ${messageId}\n ${error.message}`);
                        }
                    }
                }
            }
        }

    async setupReactionListeners(client, util) {
        const configFile = path.join(__dirname, '../data/roleMenuConfig.json');
        client.on(util.lib.Events.MessageReactionAdd, async (reaction, user) => {
            const config = this.loadConfig(configFile);

            if(!config) return;
            
            const guildId = reaction.message.guildId;
            const channelId = reaction.message.channelId; 
            const messageId = reaction.message.id;
            const emoji = reaction.emoji;
            //const emoji = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;

            const guild = client.guilds.cache.get(guildId);
            if (!guild) return;

            if (config[guildId] && config[guildId][channelId] && config[guildId][channelId][messageId]) {

                const roleMenu = config[guildId][channelId][messageId];

                if (roleMenu[emoji]) {
                    const roleId = roleMenu[emoji][0]; 
                    try{
                        const member = await guild.members.fetch(user.id);
                        const role = guild.roles.cache.get(roleId);

                        // Check if role exists and is assignable
                        if (role && !member.roles.cache.has(roleId)) {
                            await member.roles.add(role); 
                        }
                    } catch (error) {
                        util.logger.error(error.message);
                    }
                }
            } 
        });

        client.on(util.lib.Events.MessageReactionRemove, async (reaction, user) => {
            //Do Stuff.
                const config = this.loadConfig(configFile);
            if (!config) return;

            const guildId = reaction.message.guildId;
            const channelId = reaction.message.channelId; 
            const messageId = reaction.message.id;
            //const emoji = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
            const emoji = reaction.emoji;

            const guild = client.guilds.cache.get(guildId);
            if (!guild) return;

            if (config[guildId] && config[guildId][channelId] && config[guildId][channelId][messageId]) {
                const roleMenu = config[guildId][channelId][messageId];

                if (roleMenu[emoji]) {
                    const roleId = roleMenu[emoji][0]; 
                    try{
                        const member = await guild.members.fetch(user.id);
                        const role = guild.roles.cache.get(roleId);

                        // Check if role exists and is assignable
                        if (role && member.roles.cache.has(roleId)) {
                            await member.roles.remove(role); 
                        }
                    } catch (error) {
                        util.logger.error(error.message);
                    }
                }
            }
        });
    }

    loadConfig(configFile){
        if (fs.existsSync(configFile)){
            const fileContent = fs.readFileSync(configFile, 'utf-8');
            var existingConfig = fileContent ? JSON.parse(fileContent) : {};
        }
        return existingConfig;
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

    clearGuildCache(guildId){
        if(this.cache[guildId]){
            delete this.cache[guildId];
            this.util.logger.log(`${guildId} removed from cache`);
        }
    }
}

module.exports = CardinalBot;

async function uploadAttachments(message, util) {
    if (message.attachments.size > 0) {
        for (const attachment of message.attachments.values()) {
            try {
                const uploadPath = `/attachments/${message.channel.id}/${message.id}/${attachment.name}`;
                
                const fileResponse = await util.axios.get(attachment.url, { responseType: 'arraybuffer' });

                const formData = new util.FormData();
                formData.append('file', fileResponse.data, { filename: attachment.name});
                formData.append('path', uploadPath);

                await util.axios.post('https://alice.stardawn.gg/upload', formData, {
                    headers: {
                        'Authorization': `Bearer ${util.config.httpToken}`,
                        ...formData.getHeaders(),
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                });

                util.logger.log(`Uploaded attachment: ${attachment.name}`);
            } catch (error) {
                util.logger.error(`Failed to upload attachment: ${attachment.name} --- ${error}`); 
            }
        }
    }           
}

