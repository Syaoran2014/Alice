const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    category: 'administration', 
    data: new SlashCommandBuilder()
        .setName('antibot')
        .setDescription('Enable or Disable Antibot Server protection')
        .addStringOption(option => option
            .setName('options')
            .setDescription('Enable or Disable')
            .addChoices(
                { name: 'Enable', value: 'enable' },
                { name: 'Disable', value: 'disable' },
                { name: 'Status', value: 'status' }
            )
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async function(interaction, util) {
        const option = interaction.options.getString('options');

        util.dataHandler.getGuildConfig(interaction.guildId, (err, guildInfo) => {
            if(err) {
                util.logger.error(err.message);
                return interaction.reply({ content: "Error when getting guild configuration, Please contact Bot Owner." });
            }
            if(!guildInfo) {
                return interaction.reply("No server info was found, Please contact bot owner");
            }

            switch(option) {
                case "enable": 
                    util.dataHandler.getDatabase().run("UPDATE ServerConfig SET Antibot = ? WHERE GuildId = ?",
                        [1, interaction.guildId]);
                    util.BotClass.clearGuildCache(interaction.guildId); 
                    return interaction.reply(`Antibot has been enabled for ${interaction.guild}`);
                case "disable":
                    util.dataHandler.getDatabase().run("UPDATE ServerConfig SET Antibot = ? WHERE GuildId = ?",
                        [0, interaction.guildId]);
                    util.BotClass.clearGuildCache(interaction.guildId); 
                    return interaction.reply(`Antibot has been disabled for ${interaction.guild}`);
                case "status":
                    return interaction.reply(`Current Antibot status for ${interaction.guild} is ${guildInfo.Antibot}`);
                default:
                    return interaction.reply("You did something unsupported of this command");
            }
                    
        });

    },
    callback: async function(msg, args, util) {},
};
