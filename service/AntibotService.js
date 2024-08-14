const { PermissionFlagsBits } = require("discord.js");

class AntibotService {
    constructor(util) {
        this.util = util;
        this.violations = new Map();
    }
    
    async antibot(message){

        if(message.content.includes('discord.gg/') && message.content.includes('@everyone')) {
            if (message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return;
            }

            if(!message.deletable) return;
            await message.channel.send(`That message has triggered antibot actions. If you believe this is an error please contact <@129421280536428545>`);
            await message.delete();

            const currentTime = Date.now();
            const timeouts = this.violations.get(message.author.id) || [];
            timeouts.push(currentTime);

            this.violations.set(message.author.id, timeouts.filter(t => currentTime - t < 60000));

            if(this.violations.get(message.author.id).length >= 3) {
                const banOptions = { days: 1, reason: "Antibot Activated" };
                message.guild.members.ban(message.author, banOptions).catch(console.error);
                this.violations.delete(message.author.id);
            }
        }
    }
}

module.exports = AntibotService;
