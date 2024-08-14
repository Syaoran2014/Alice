const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Shows User Profile and information")
        .addUserOption((option) =>
            option
              .setName('target')
              .setDescription("User to select, leave blank for yourself")
              .setRequired(false)),
    execute: async function (interaction, util) {
        const userOption = interaction.options.getUser('target');
        const user = userOption ? userOption.id : interaction.user.id;
        util.dataHandler.getUserInfo(user, (err, userInfo) => {
            if (err){
                util.logger.error(err.message);
                return interaction.reply({
                    content: "Something didn't process right, Please contact bot owner",
                });
            }
            if (!userInfo) {
                return interaction.reply({
                    content: "Your user data has likely not been initialized!\n If you are seeing this multiple times, something has gone wrong, please contact the bot owner.",
                });
            } else {
                const pUser = userInfo.UserName;
                const currentLevel = userInfo.ChatLvl;
                const xp = parseInt(userInfo.ChatExp);
                const nextLvlExp = userInfo.LevelXp;
                const currency = userInfo.Currency;
                const dailyStreak = userInfo.DailyStreak;
                const inv = userInfo.Inventory;

                const embed = {
                    color: parseInt("f0ccc0", 16),
                    title: `${pUser} user profile`,
                    //description: 'Titles:\n',
                    fields: [
                        {
                            name: 'Progress:',
                            value: `Level ${currentLevel}\nXP: ${xp.toLocaleString()}/${nextLvlExp.toLocaleString()}`,
                        },
                        {
                            name: 'Currency:',
                            value: `${currency}`,
                        },
                        {
                            name: 'Daily Streak:',
                            value: `${dailyStreak}`,
                            inline: true,
                        },
                        {
                            name: 'Inventory:', 
                            value: `${inv}`,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: 'Maidenless'
                    },
                };

                return interaction.reply({
                    embeds: [embed],
                });
            }
        });
    },
    callback: async function (msg, args, util) {
        
    }
};
