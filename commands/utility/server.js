const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server"),
    async execute(interaction, util) {
        util.dataHandler.getGuildConfig(interaction.guild.id, (err, guildInfo) => {
            if (err) {
                util.logger.error(err.message);
                return interaction.reply("Something didn't process right, if issue persists, contact bot owner");
            }
            if (!guildInfo) return interaction.reply("No guild info was obtained");

            const embed = {
                color: parseInt("f0ccc0", 16),
                title: `${interaction.guild.name} server config`,
                fields: [
                    {
                        name: 'Logs:',
                        value: guildInfo.LogEnabled ? `Logs are enabled and currently set to <#${guildInfo.LogChannel}>` : `Logs are disabled in this server`,
                    },
                    {
                        name: 'AutoRole:',
                        value: guildInfo.AutoRoleEnabled ? `Autorole is enabled and currently set to <@&${guildInfo.AutoRole}>` : 'Autorole is disabled in this server',
                    },
                    {
                        name: 'Antibot:',
                        value: guildInfo.Antibot ? 'Antibot is enabled' : 'Antibot is disabled',
                    },
                ],
            };

            return interaction.reply({ embeds: [embed] });

        });

    },
    async callback(msg, args, util) {
        util.dataHandler.getGuildConfig(msg.guild.id, (err, guildInfo) => {
            if (err) {
                util.logger.error(err.message);
                return msg.reply("Something didn't process right, if issue persists, contact bot owner");
            }
            if (!guildInfo) return msg.reply("No guild info was obtained");

            const embed = {
                color: parseInt("f0ccc0", 16),
                title: `${msg.guild.name} server config`,
                fields: [
                    {
                        name: 'Logs:',
                        value: guildInfo.LogEnabled ? `Logs are enabled and currently set to <#${guildInfo.LogChannel}>` : `Logs are disabled in this server`,
                    },
                    {
                        name: 'AutoRole:',
                        value: guildInfo.AutoRoleEnabled ? `Autorole is enabled and currently set to <@&${guildInfo.AutoRole}>` : 'Autorole is disabled in this server',
                    },
                    {
                        name: 'Antibot:',
                        value: guildInfo.Antibot ? 'Antibot is enabled' : 'Antibot is disabled',
                    },
                ],
            };

            return msg.reply({ embeds: [embed] });

        });
    },
};
