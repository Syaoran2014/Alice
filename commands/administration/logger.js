const {SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    category: 'administration',
    data: new SlashCommandBuilder()
        .setName("logger")
        .setDescription("Manage the logging servicer per server.")
        .addStringOption(option => 
            option
                .setName("options")
                .setDescription("Options to manage the logging service")
                .setRequired(true)
                .addChoices(
                    { name: 'Enable', value: "enable" },
                    { name: 'Disable', value: "disable" },
                    { name: 'Set Channel', value: 'set' }
                ))
                .addChannelOption(option => 
                    option
                        .setName("channel")
                        .setDescription("The Channel to set logging (required for 'set' option)")
                        .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async function (interaction, util) {
        const cOption = interaction.options.getString('options');
        const cServer = interaction.guildId;
        const setLogChannel = interaction.options.getChannel('channel'); 
        var logChannel = null; 
        if (setLogChannel){
            logChannel = setLogChannel.id;
        }
        //Gets Guild config for some reason??? I can't remember what for....
        util.dataHandler.getGuildConfig(cServer, (err, guildInfo) => {
            if (err){
                util.logger.error(err.message);
                return interaction.reply({content: "Something didn't process right, Try again later."});
            }
            if (!guildInfo) {
                return interaction.reply({
                    content: "No Server Info Found, Please try again later."
                });
            } else {
                const logStatus = guildInfo.LogEnabled;
                const currentLogChannel = guildInfo.LogChannel;
                
                switch(cOption){
                    case "enable":
                        if (!logChannel){
                            if (!currentLogChannel){
                                return interaction.reply({content: "No Log Channel set, Please enter a channel to log too"});
                            } else {
                                util.dataHandler.getDatabase().run("UPDATE ServerConfig SET LogEnabled = ? WHERE GuildId = ?", 
                                [1, cServer]);
                                return interaction.reply({content: `Logging has been enabled for ${interaction.guild} in channel <#${currentLogChannel}>`});   
                            }
                        } else {
                            util.dataHandler.getDatabase().run("UPDATE ServerConfig SET LogEnabled = ?, LogChannel = ? WHERE GuildId = ?",
                            [1, logChannel, cServer]);
                            return interaction.reply({content: `Logging has been enabled for ${interaction.guild} in channel <#${logChannel}>`});
                        }
                    case "disable":
                        if(!logStatus) {
                            return interaction.reply({content: "Server Logging has been disabled"});
                        } 
                        util.dataHandler.getDatabase().run("UPDATE ServerConfig SET LogEnabled = ? WHERE GuildId = ?", 
                        [0, cServer]);
                        return interaction.reply({content: "Server Logging has been disabled"});
                    case "set":
                        if(!logChannel) {
                            return interaction.reply({content: "You must specify a channel for logging!"});
                        }
                        util.dataHandler.getDatabase().run("UPDATE ServerConfig SET LogChannel = ? WHERE GuildId = ?", 
                        [logChannel, cServer]);
                        return interaction.reply({content: `Logging channel has been set to <#${logChannel}>`});
                    default:
                        return interaction.reply({content: "No option was set, please enter an option and try again"});
                }
            }
        });
    }
};