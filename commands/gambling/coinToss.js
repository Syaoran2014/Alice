const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    category: 'gambling',
  data: new SlashCommandBuilder()
    .setName("cointoss")
    .setDescription("50/50 Shot to double your bet!")
    .addNumberOption((option) => 
      option
        .setName('amount')
        .setDescription("Amount you want to bet")
        .setRequired(true))
    .addStringOption((option) => 
      option
        .setName('choice')
        .setDescription("Heads or Tails")
        .setRequired(true)
        .addChoices(
            {name: 'Heads', value: 'heads'},
            {name: 'Tails', value: 'tails'}
        )),
  execute: async function (interaction, util) {
    const betAmount = interaction.options.getNumber('amount');
    const choice = interaction.options.getString('choice');
    const userId = interaction.user.id;

    util.dataHandler.getUserInfo(userId, (err, userInfo) => {
        if (err){
            util.logger.error(err.message);
            return interaction.reply({ content: "Something didn't process right, Please contact bot owner"});
        }
        if (!userInfo) {
            return interaction.reply({ content: "Your user data has likely not been initialized!\n Please try again."});
        } else {
            const userCurrency = userInfo.Currency;

            if (betAmount > userCurrency) {
                return interaction.reply({ content: `You do not have that amount, try again with a lower amount!`});
            } 
            
            const result = Math.random() < 0.5 ? 'heads' : 'tails'; 
            if (result === choice) {
                const paidAmount = userCurrency + betAmount;
                util.dataHandler.getDatabase().run("UPDATE DiscordUserData SET Currency = ? WHERE UserId = ?",
                [paidAmount, userId],
                (err) => {
                    if (err) {
                      this.util.logger.error(err.message);
                      return;
                    }
                    return interaction.reply(`Congrats! You WIN\nYou've won ${betAmount} Alcoins!`);
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
                    return interaction.reply({ content: `Unfortunately you lost, the coin was ${result} and you chose ${choice}`});
                });
            }
        }
    });
  },

  callback: async function (msg, args, util) {},
};
