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
    const betAmount = interaction.options.getNumber('amount');
    const userId = interaction.user.id;

    util.dataHandler.getUserInfo(userId, (err, userInfo) => {
        if (err){
            util.logger.error(err.message);
            return interaction.reply({ content: "Something didn't process right, Please contact bot owner"});
        }
        if (!userInfo) {
            return interaction.reply({ content: "Your user data has likely not been initialized!\n Send a normal message and try again!"});
        } else {
            const userCurrency = userInfo.Currency;

            if (betAmount > userCurrency) {
                return interaction.reply({ content: `You do not have that amount, try again with a lower amount!`});
            } 
            
            const result = Math.floor(Math.random() * 100) + 1;
            if (result === 100) {
                const winningAmount = betAmount * 10;
                const paidAmount = winningAmount + userCurrency;
                util.dataHandler.getDatabase().run("UPDATE DiscordUserData SET Currency = ? WHERE UserId = ?",
                [paidAmount, userId],
                (err) => {
                    if (err) {
                      this.util.logger.error(err.message);
                      return;
                    }
                    return interaction.reply(`Congrats! You WIN\n The number was ${result} \nYou've won ${winningAmount} Alcoins!`);
                });
            } else if (result >= 90 && result < 100 ){
                const winningAmount = betAmount * 4;
                const paidAmount = winningAmount + userCurrency;
                util.dataHandler.getDatabase().run("UPDATE DiscordUserData SET Currency = ? WHERE UserId = ?",
                [paidAmount, userId],
                (err) => {
                    if (err) {
                      this.util.logger.error(err.message);
                      return;
                    }
                    return interaction.reply(`Congrats! You WIN\n The number was ${result} \nYou've won ${winningAmount} Alcoins!`);
                });
            } else if (result >= 66 && result < 90 ){
                const winningAmount = betAmount * 2;
                const paidAmount = winningAmount + userCurrency;
                util.dataHandler.getDatabase().run("UPDATE DiscordUserData SET Currency = ? WHERE UserId = ?",
                [paidAmount, userId],
                (err) => {
                    if (err) {
                      this.util.logger.error(err.message);
                      return;
                    }
                    return interaction.reply(`Congrats! You WIN\n The number was ${result} \nYou've won ${winningAmount} Alcoins!`);
                });
            } else {
                const lostAmount = userCurrency - betAmount;
                util.dataHandler.getDatabase().run("UPDATE DiscordUserData SET Currency = ? WHERE UserId = ?",
                [lostAmount, userId],
                (err) => {
                    if (err) {
                        this.util.logger.error(err.message);
                        return;
                    }
                return interaction.reply({ content: `Unfortunately you lost :(\nThe number was ${result}`});
                 });
            }
        }
    });
  },

  callback: async function (msg, args, util) {},
};

