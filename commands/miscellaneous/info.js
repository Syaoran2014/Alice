const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const embed = new EmbedBuilder()
    .setTitle("Alice Info!")
    .setColor(0xEEB1B1)
    .setDescription("Currently I can do the following:\n-Server Logging\n-Manage Exp and Currency\n-Play Music\n-Gambling Commands\n-Say and Edit my messages\n-Simple self assignable role menus\n-Generic Polls")
    .setFooter({ text:"I am still under development, some items may contain bugs and not work correctly"});

module.exports = {
    category: 'miscellaneous',
    data: new SlashCommandBuilder()
    .setName("info")  
    .setDescription("General Alice information"),
    execute: async function(interaction, util) {
       return interaction.reply({ embeds: [embed] }); 
    },
    callback: async function(msg, args, util) {
        util.logger.log(args);
        return msg.channel.send({ embeds: [embed] });
    },
};

