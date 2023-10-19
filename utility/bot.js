const { ActivityType } = require("discord.js");

class CardinalBot {
  constructor(util) {
    /*
            initialize discord bot here
            */
    this.util = util;
    this.client = this.util.bot;

    // Log in to Discord with client's token.
    this.client.login(util.config.token);

    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it seperate from the already defined 'client'
    this.client.once(util.lib.Events.ClientReady, (c) => {
      this.util.logger.log(`Ready! Logged in as ${c.user.tag}`);
      c.user.setActivity(`with your heart! ❤`, { type: ActivityType.Playing });
    });

    //Initialize both Command Handlers.
    this.client.on(this.util.lib.Events.MessageCreate, async (message) => {
      if (message.content.startsWith(this.util.config.prefix)) {
        this.util.commandHandler.handleCommand(message);
      }
    });

    this.client.on(this.util.lib.Events.InteractionCreate, (interaction) => {
      this.util.commandHandler.handleInteraction(interaction);
    });
  }
}

module.exports = CardinalBot;
