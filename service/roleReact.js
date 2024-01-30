const fs = require("fs");
const path = require("path");

class roleReact { 
    constructor(util) {
        this.util = util;
        //const configFile = path.join(__dirname, '../data/roleMenuConfig.json');


        // this.util.bot.on(this.util.lib.Events.MessageReactionAdd, async (reaction, user) => {
        //     var config = this.loadConfig(configFile);

        //     const guildId = reaction.message.guildId;
        //     const message = reaction.message.id;
        //     const emoji = reaction.emoji;

        //     // this.util.logger.log(`Guild: ${guildId}\nMessageId: ${message}\nEmoji: ${emoji}\nConfig: ...`);

        //     // if (user.id === '129421280536428545'){
        //     //     await this.util.bot.channels.cache.get(reaction.message.channelId).send({ content: `Guild: ${guildId}\nMessageId: ${message}\nEmoji: ${emoji}\nConfig: ${config[guildId]}`});
        //     // }
        //     return; 
        // });

        // this.util.bot.on(this.util.lib.Events.MessageReactionRemove, async (reaction, user) => {
        //     this.util.logger.log(`Remove Triggered`);
        //     return; 
        // });
    }

    loadConfig(configFile) {
        if (fs.existsSync(configFile)) {

        const fileContent = fs.readFileSync(configFile, 'utf-8');
        var existingConfig = fileContent ? JSON.parse(fileContent) : {};
        }
        return existingConfig; 
    }
}

module.exports = roleReact;