const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    category: 'activity',
    data: new SlashCommandBuilder()
      .setName('pay')
      .setDescription("Command used to pay other people")
      .addUserOption((option) => 
        option
          .setName('user')
          .setDescription("User to send currency too")
          .setRequired(true))
      .addNumberOption((option) => 
        option
          .setName('amount')
          .setDescription("Amount to pay the user")
          .setRequired(true)),
    execute: async function (interaction, util) {
        const userId = interaction.user.id;
        const paidUser = interaction.options.getUser('user');
        const amountToPay = interaction.options.getNumber('amount');

        util.dataHandler.getUserInfo(userId, (err, userInfo) => {
            if (err){
                util.logger.error(err.message);
                return interaction.reply(`Something didn't process right, Please contact bot owner.`);
            }

            if(!userInfo) {
                return interaction.reply(`No user info was found, please try again later.`);
            }

            const userCurrency = userInfo.Currency;
            
            if(amountToPay > userCurrency) { 
                return interaction.reply(`You don't have that much to send. Your current balance is ${userCurrency}.`);
            }
            util.dataHandler.getUserInfo(paidUser.id, (err, userInfo) => {
                if(err) { 
                    util.logger.error(err.message);
                    return interaction.reply(`Error when attempting to retrieve payee user data.`);
                }

                if(!userInfo){
                    return interaction.reply(`The user you are trying to pay currently does not exist in the database.\nHave them send a message or command and retry your command again!`);
                }

                util.dataHandler.getDatabase().run(
                    "UPDATE DiscordUserData SET Currency = CASE WHEN UserId = ? THEN Currency + ? WHEN UserId = ? THEN Currency - ? ELSE Currency END WHERE UserId IN (?, ?)",
                    [paidUser.id, amountToPay, userId, amountToPay, paidUser.id, userId]
                );

                return interaction.reply(`Successfully paid ${paidUser.username} ${amountToPay} Alcoins!`);
            })
        })
    }
}