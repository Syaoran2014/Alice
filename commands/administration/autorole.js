const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    category: 'administration',
    data: new SlashCommandBuilder()
      .setName('autorole')
      .setDescription('Setup AutoRole on Member join.')
      .addStringOption(option => option
        .setName('options')
        .setDescription("Enable/Disable AutoRole")
        .addChoices(
            { name: 'Enable', value: "enable" },
            { name: 'Disable', value: "disable" },
            { name: 'Set Role', value: 'set' }
        )
        .setRequired(true))
      .addRoleOption(option => option
        .setName("role")
        .setDescription("The role to assign when a user joins."))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: async function(interaction, util) {
            const cOption = interaction.options.getString('options');
            const role = interaction.options.getRole("role");

            util.dataHandler.getGuildConfig(interaction.guildId, (err, guildInfo) => {
                if (err) { 
                    util.logger.error(err.message);
                    return interaction.reply({ content: "Error when getting guild configuration, Please contact Bot Owner." });
                }
                if (!guildInfo) { 
                    return interaction.reply({ content: "No Server Info found, Please contact bot owner" });
                }
                
                const autoRoleStatus = guildInfo.AutoRoleEnabled; 
                const currentAutoRole = guildInfo.AutoRole; 

                switch(cOption) {
                    case "enable": 
                        if (!currentAutoRole) {
                            if (!role) {
                                return interaction.reply({ content: "No Role Set or Provided, Please try again providing a role to the option.", ephmeral: true});
                            } 

                            util.dataHandler.getDatabase().run("UPDATE ServerConfig SET AutoRoleEnabled = ?, AutoRole = ? WHERE GuildId = ?", 
                            [1, role.id ,interaction.guildId]);
                            return interaction.reply(`AutoRole has been enabled for ${interaction.guild} with role ${role}!`);
                        }
                        util.dataHandler.getDatabase().run("UPDATE ServerConfig SET AutoRoleEnabled = ? WHERE GuildId = ?", 
                        [1 ,interaction.guildId]);
                        return interaction.reply(`AutoRole has been enabled for ${interaction.guild}!`);
                    case "disable": 
                        if(!autoRoleStatus){
                            return interaction.reply({ content: "AutoRole has been disabled!" });
                        }
                        util.dataHandler.getDatabase().run("UPDATE ServerConfig SET AutoRoleEnabled = ?, AutoRole = ? WHERE GuildId = ?", 
                        [0, interaction.guildId]);
                        return interaction.reply(`AutoRole has been disabled.`);
                    case "set": 
                        if(!role) {
                            return interaction.reply({ content: "You must specify a role with this option!" });
                        }

                        util.dataHandler.getDatabase().run("UPDATE ServerConfig SET AutoRole = ? WHERE GuildId = ?",
                        [role.id, interaction.guildId]);
                        return interaction.reply({ content: `AutoRole has been set to ${role}`});
                    default: 
                        return interaction.reply({ content: "You did something unexpected, please try again with proper options."});
                }
            });
        }
};