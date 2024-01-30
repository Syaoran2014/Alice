const { ActivityType } = require("discord.js");
const fs = require("fs"); 
const path = require("path");

class CardinalBot {
  constructor(util) {
    this.util = util;
    this.client = this.util.bot;
    const expService = this.util.services.get('ExpService');
    const economyService = this.util.services.get('EconomyService');

    // Log in to Discord with client's token.
    this.client.login(util.config.token);

    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it seperate from the already defined 'client'
    this.client.once(util.lib.Events.ClientReady, (c) => {
      this.util.logger.log(`Ready! Logged in as ${c.user.tag}`);
      c.user.setActivity(`with your heart! ❤`, { type: ActivityType.Playing });

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
      } else {
        const userExists = await this.checkUserData(message.author.id);
        if(userExists) {
          expService.generateExp(message.author);
          economyService.generateCurrency(message.author);
        } else {
          this.util.dataHandler.initializeUserInfo(message.author, message.guild.id);
        }
      }
      if (message.content.startsWith(this.util.config.prefix)) {
        this.util.commandHandler.handleCommand(message);
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
      this.util.commandHandler.handleInteraction(interaction);
    });
  }

  //Checks user data. I only care if exists or not.
  async checkUserData(user) {
    return new Promise((resolve, reject) => {
      this.util.dataHandler.getUserInfo(user, (err, userInfo) => {
        if (err) {
          reject(err);
        } else {
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

      const guildId = reaction.message.guildId;
      const channelId = reaction.message.channelId; 
      const messageId = reaction.message.id;
      const emoji = reaction.emoji.toString();

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

      const guildId = reaction.message.guildId;
      const channelId = reaction.message.channelId; 
      const messageId = reaction.message.id;
      const emoji = reaction.emoji.toString();

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

}

module.exports = CardinalBot;
