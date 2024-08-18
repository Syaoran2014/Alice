const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    category: 'gambling',
    data: new SlashCommandBuilder()
    .setName("betroll")
    .setDescription("Roll a 66 or Higher to be a winner!")
    .addNumberOption((option) => 
        option
        .setName('amount')
        .setDescription("Amount you want to bet")
        .setRequired(true)),
    execute: async function (interaction, util) {
        await interaction.deferReply();
        let betAmount = interaction.options.getNumber('amount');
        const userId = interaction.user.id;

        if (betAmount < 0) {
            return interaction.followUp("Nice Try, You can't bet negative numbers");
        }
        betAmount = Math.floor(betAmount);
        util.dataHandler.getUserInfo(userId, (err, userInfo) => {
            if (err){
                util.logger.error(err.message);
                return interaction.followUp({ content: "Something didn't process right, Please contact bot owner"});
            }
            if (!userInfo) {
                return interaction.followUp({ content: "Your user data has likely not been initialized!\n Send a normal message and try again!"});
            } else {
                let userCurrency = userInfo.Currency;


                if (betAmount > userCurrency) {
                    return interaction.followUp({ content: `You do not have that amount, try again with a lower amount!`});
                } 

                const result = Math.floor(Math.random() * 100) + 1;
                var winningAmount = 0;

                switch(true){
                    case (result == 100):
                        winningAmount = (betAmount * 10) - betAmount;
                        util.dataHandler.payout(userId, winningAmount);
                        return interaction.followUp(`Congrats! You WIN\nThe number was ${result}\nYou've won ${winningAmount + betAmount} Alcoins! (+${winningAmount})`)
                    case (result >= 90 && result < 100):
                        winningAmount = (betAmount * 4) - betAmount;
                        util.dataHandler.payout(userId, winningAmount);
                        return interaction.followUp(`Congrats! You WIN\nThe number was ${result}\nYou've won ${winningAmount + betAmount} Alcoins! (+${winningAmount})`)
                    case (result >= 66 && result < 90):
                        winningAmount = (betAmount * 2) - betAmount;
                        util.dataHandler.payout(userId, winningAmount);
                        return interaction.followUp(`Congrats! You WIN\nThe number was ${result}\nYou've won ${winningAmount + betAmount} Alcoins! (+${winningAmount})`)
                    case (result >= 55 && result < 66):
                        winningAmount = Math.floor((betAmount * .75) - betAmount);
                        util.dataHandler.payout(userId, winningAmount);
                        return interaction.followUp(`The number was ${result}\nYou got back ${winningAmount + betAmount} Alcoins! (${winningAmount})`)
                    default:
                        util.dataHandler.payout(userId, betAmount * -1);
                        return interaction.followUp({ content: `Unfortunately you lost :(\nThe number was ${result}\nYou lost -${betAmount} Alcoins.`});
                }

            }
        });
    },

    callback: async function (msg, args, util) {},
};

