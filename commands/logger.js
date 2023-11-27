const {SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
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
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async function (interaction, util) {
        const cOption = interaction.options.getString('options');
        const cServer = interaction.guildId;

        switch(cOption){
            case "enable":
                break;
            case "disable":
                break;
            case "set":
                break;
            default:
                return interaction.reply({content: "No option was set, please enter an option and try again"});
        }

        //Gets Guild config for some reason??? I can't remember what....
        util.dataHandler.getGuildConfig(cServer, (err, guildInfo) => {
            if (err){
                util.logger.error(err.message);
                return interaction.reply({content: "Something didn't process right, Try again later."})
            }
            if (!guildInfo) {
                return interaction.reply({
                    content: "No Server Info Found, Please try again later.",
                });
            } else {
                var logStatus = guildInfo.LogEnabled;
                
            }
        })
    }
}