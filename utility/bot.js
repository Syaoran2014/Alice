const { ActivityType } = require("discord.js");

class CardinalBot {
  constructor(util) {
    /*
            initialize discord bot here
            */
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
    });


    this.client.on(this.util.lib.Events.guildCreate, async (guild) => {
      this.util.dataHandler.getDatabase()
        .run(
          "INSERT INTO ServerConfig (GuildId, LogEnabled, LogChannel, MutedRole, DisabledCmds) VALUES(?, ?, ?, ?, ?);",
          [guild.id, null, null, null, "[]"],
          (err) => {
            util.logger.log(
              `Set guild data for: ${guild.name} (${guild.id}) members: ${guild.memberCount}`
            );
            if (err) {
              util.logger.error(err.message);
              return;
            }
          }
        );
    })

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
}

module.exports = CardinalBot;
