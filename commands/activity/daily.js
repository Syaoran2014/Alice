const { SlashCommandBuilder } = require("discord.js");

const dailyCooldown = new Map();

module.exports = {
    category: 'activity',
    dailyCooldown, 
    data: new SlashCommandBuilder()
      .setName("daily")
      .setDescription("Daily Currency Generation"),
    execute: async function (interaction, util) {
        const userId = interaction.user.id;
        const baseDailyAmount = 1000; 
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() +1, 0, 0, 0);
        const timeToMidnight = midnight.getTime() - now.getTime();
        const hours = Math.floor(timeToMidnight / (1000 * 60 * 60));
        const minutes = Math.floor((timeToMidnight % (1000 * 60 * 60)) / (1000 * 60));

        if (dailyCooldown.has(userId)) {
            //const seconds = Math.floor((timeToMidnight % (100 * 60)) / 1000); 
            return interaction.reply(`You already claimed today's daily, Try again in ${hours} hours ${minutes} minutes.`);
        }

        util.dataHandler.getUserInfo(userId, (err, userInfo) => {
            if (err) {
                return interaction.reply("An Error has occurred.");
            }
            if (!userInfo) {
                return interaction.reply("User data not found...");
            }

            const lastClaimDate = new Date(userInfo.LastDailyClaim);

            now.setHours(0, 0, 0, 0);
            lastClaimDate.setHours(0, 0, 0, 0);
            if (now.getTime() == lastClaimDate.getTime()) {
                dailyCooldown.set(userId, Date.now());
                return interaction.reply(`You already claimed today's daily, Try again in ${hours} hours ${minutes} minutes.`);
            }
            const timeDiff = now - lastClaimDate;
            const diffDays = timeDiff / (1000 * 3600 * 24);


            if (diffDays === 0 || diffDays === 1) {
                if (userInfo.DailyStreak === null) {
                    userInfo.DailyStreak = 0; 
                }
                if (diffDays === 1) {
                    userInfo.DailyStreak += 1;
                }
            } else {
                userInfo.DailyStreak = 1;
            }

            const multiplier = 1 + (0.1 * userInfo.DailyStreak);
            const dailyAmount = Math.floor(baseDailyAmount * multiplier);

            util.dataHandler.getDatabase().run(
                "UPDATE DiscordUserData SET Currency = Currency + ?, DailyStreak = ?, LastDailyClaim = ? WHERE UserId = ?",
                [dailyAmount, userInfo.DailyStreak, now.toISOString(), userId]
            );
            dailyCooldown.set(userId, Date.now());
            return interaction.reply(`You gained your daily ${dailyAmount} Alcoins. Current Streak: ${userInfo.DailyStreak}`);
        });


    }
};
