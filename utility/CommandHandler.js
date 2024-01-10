class CommandHandler {
  constructor(util) {
    this.util = util;
    this.commands = [];
    this.sCommands = [];
    this.util.bot.once('ready', () => {
      this.registerCommands();
    })
  }

  //Loops through, adds and registers commands with Discord API.
  async registerCommands() {
    this.util.logger.log("Registering Commands.");
    this.util.bot.commands = new this.util.lib.Collection();
    const folderPath = this.util.path.join(__dirname, "../commands");
    const commandFolders = this.util.fs.readdirSync(folderPath);

    for (const folder of commandFolders){
      const commandsPath = this.util.path.join(folderPath, folder);
      const commandFiles = this.util.fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
      for(const file of commandFiles){
        const filePath = this.util.path.join(commandsPath, file);
        const command = require(filePath);
        const commandName = file.split(".js")[0];
        if("data" in command && "execute" in command) {
          this.util.logger.log(`   - ${commandName} registered as command!`);
          this.util.bot.commands.set(command.data.name, command);

          //This is split into 2 arrays, application commands and text commands didn't work right together the way I have it set up.
          //Maybe Ill come back and refactor this?
          this.sCommands.push(command.data.toJSON());
          this.commands[commandName] = command;
        } else {
          this.util.logger.warn(
            `[WARNING] The command at ${commandName} is missing a required "data" or "execute" property.`
          );
        }
      }
    }
    const rest = new this.util.lib.REST().setToken(this.util.config.token);

    const guilds = this.util.bot.guilds.cache.values();
    for (const guild of guilds) {
      try {
        this.util.logger.log(
          `Started refreshing ${this.sCommands.length} application (/) commands in ${guild.name}`
        );
        

       const data = await rest.put(
          this.util.lib.Routes.applicationGuildCommands(
            this.util.config.clientId,
            guild.id
          ),
          { body: this.sCommands }
        );

        this.util.logger.log(
          `Successfully reloaded ${data.length} application (/) commands in ${guild.name}`
        );
      } catch (error) {
      this.util.logger.error(error);
      }
    };
  }

  //Handles Application commands, and calls execute in a command.
  async handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      this.util.logger.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction, this.util);
    } catch (error) {
      this.util.logger.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  }

  // Handles chat commands, and calls callback in the command file.
  handleCommand(message) {
    if (message.author.bot || message.author.id == this.util.bot.user.id) {
      return;
    }
    let commandName = message.content
      .split(this.util.config.prefix)[1]
      .split(" ")[0]
      .toLowerCase();
    let args = message.content
      .replace(this.util.config.prefix + commandName, "")
      .split(" ")
      .slice(
        1,
        message.content
          .replace(this.util.config.prefix + commandName, "")
          .split(" ").length
      );
    let command = this.commands[commandName];
    if (command == null) {
      for (var i = 0; i < Object.keys(this.commands).length; i++) {
        if (
          this.commands[Object.keys(this.commands)[i]].aliases != null &&
          this.commands[Object.keys(this.commands[i])].aliases.indexOf(
            commandName
          ) != -1
        ) {
          command = this.commands[Object.keys(this.commands)[i]];
          break;
        }
      }
      if (command == null) {
        return;
      }
    }
    message.channel.sendTyping();
    command.callback(message, args, this.util);
    // message.channel.stopTyping();
  }

  deleteAllCommands() {
      try {

        const rest = new this.util.lib.REST().setToken(this.util.config.token);
        this.util.logger.log(`Deleting all application commands. `);
        
        const guilds = this.util.bot.guilds.cache.values();
        
        for(const guild of guilds) {
          rest.put(this.util.lib.Routes.applicationGuildCommands(this.util.config.clientId, guild.id), { body: [] })
            .then(() => this.util.logger.log(`Successfully deleted all application in ${guild.name}`));
        }

        // rest.put(this.util.lib.Routes.applicationGuildCommands(this.util.config.clientId, this.util.config.guildId), { body: [] })
        //   .then(() => this.util.logger.log(`Successfully deleted all application commands`));
      } catch (error){
        this.util.logger.error(error);
      }
  }
}

module.exports = CommandHandler;
