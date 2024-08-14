const { SlashCommandBuilder } = require("discord.js"); 

const hourlyCooldown = new Map();

module.exports = {
    category: 'activity', 
    hourlyCooldown,
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Hourly Currency Generation"),
    execute: async function(interaction, util) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const baseWorkAmount = 100;
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setMinutes(0, 0, 0);
        nextHour.setHours(nextHour.getHours() + 1);
        const timeToNextHour = nextHour.getTime() - now.getTime();
        const minutes = Math.floor((timeToNextHour % (1000 * 60 * 60)) / (1000 * 60));

        if(hourlyCooldown.has(userId)){
            return interaction.followUp(`You have already worked this hour. Please take your legally mandated break and return in ${minutes} minutes.`);
        }

        util.dataHandler.getUserInfo(userId, (err, userInfo) => {
            if (err) {
                util.logger.error(err); 
                return interaction.followUp("An Error had occured.");
            }
            if (!userInfo) {
                return interaction.followUp("User data not found...");
            }

            const paidWork = Math.floor(Math.round((Math.random() * 9 + 1) * 100 ) / 100 * baseWorkAmount); 

            util.dataHandler.payout(userId, paidWork);
            hourlyCooldown.set(userId, Date.now());
            
            switch(true) {
                case (paidWork >= 100 && paidWork <= 200): 
                    return interaction.followUp(`Your work was laughable.\nYou were paid ${paidWork} Alcoins.`);
                case (paidWork >= 201 && paidWork <= 350):
                    return interaction.followUp(`You were underperforming, but there's potential. \nYou were paid ${paidWork} Alcoins.`);
                case (paidWork >= 351 && paidWork <= 500):
                    return interaction.followUp(`Not bad, but you can definitely do better.\nYou were paid ${paidWork} Alcoins.`);
                case (paidWork >= 501 && paidWork <= 650):
                    return interaction.followUp(`Solid effort!\nYou were paid ${paidWork} Alcoins.`);
                case (paidWork >= 651 && paidWork <= 800):
                    return interaction.followUp(`Great job! Your work was impressive.\nYou were paid ${paidWork} Alcoins.`);
                case (paidWork >= 801 && paidWork <= 1000):
                    return interaction.followUp(`Outstanding! You're a top performer!\nYou were paid ${paidWork} Alcoins.`);
                default:
                    return interaction.followUp(`<@129421280536428545> Amount ${paidWork} was out of expected range!\nPayment still went through`);

            }
        });

    },
    callback: async function(msg, args, util) {}
}
