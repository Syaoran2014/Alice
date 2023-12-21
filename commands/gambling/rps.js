const { SlashCommandBuilder } = require("discord.js");

module.exports = { 
    category: 'gambling', 
    data: new SlashCommandBuilder()
      .setName('rps')
      .setDescription("Classic Rock Paper Scissors")
      .addStringOption((option) => 
        option
          .setName("choice")
          .setDescription("Rock, Paper, or Scissors")
          .setRequired(true)
          .addChoices(
            {name: "Rock", value: "rock"},
            {name: "Paper", value: "paper"},
            {name: "Scissors", value: "scissors"}
          ))
      .addNumberOption((option) => 
        option
          .setName('wager')
          .setDescription("Amount you would like to wager.")
          .setRequired(true)),
    execute: async function (interaction, util) { 
        let betAmount = interaction.options.getNumber('wager');
        const choice = interaction.options.getString('choice');
        const userId = interaction.user.id;
        let winAmount = 0;
        if (betAmount < 0) {
            return interaction.reply("Nice Try, You can't bet negative numbers");
        }
        betAmount = Math.floor(betAmount);
 
        util.dataHandler.getUserInfo(userId, (err, userInfo) => {
            if (err) {
                util.logger.error(err);
                return interaction.reply("Something didn't process correctly, Please contact bot owner if issue persists.");
            }
            if (!userInfo) {
                return interaction.reply("Userdata has likely not been initialized!\n Please try again.");
            }

            const userCurrency = userInfo.Currency;

            if (betAmount > userCurrency) { 
                return interaction.reply("You don't have that much! Try again with a lower wager.");
            }
            const rps = ['rock', 'paper', 'scissors'];
            const result = rps[Math.floor(Math.random() * rps.length)];

            const resultFile = `assets/rps/${result}.png`;
            const fileName = resultFile.split('/').pop();

            const gameEmbed = {
                author: {
                    icon_url: interaction.user.avatarURL(),
                },
                title: `RPS Game`,
                image: {
                    url: `attachment://${fileName}`
                }
            }

            if( choice === result ){
                gameEmbed.title = `Draw! We both chose ${result}!\nSmart Choice.`
                interaction.reply({ embeds: [gameEmbed], files: [resultFile]});
            } else { 
                switch(choice) {
                    case "rock": 
                        if (result === 'paper') {
                            winAmount -= betAmount;
                            gameEmbed.title = `${result} beats ${choice}, You lost ${winAmount}.`
                            interaction.reply({ embeds: [gameEmbed], files: [resultFile]});
                        } else if (result === 'scissors') {
                            winAmount += betAmount;
                            gameEmbed.title = `${result} beats ${choice}, You WIN ${winAmount} Alcoins!`
                            interaction.reply({ embeds: [gameEmbed], files: [resultFile]});
                        }
                        break;
                    case "paper":
                        if (result === 'scissors') {
                            winAmount -= betAmount;
                            gameEmbed.title = `${result} beats ${choice}, You lost ${winAmount}.`
                            interaction.reply({ embeds: [gameEmbed], files: [resultFile]});
                        } else if (result === 'rock') {
                            winAmount += betAmount;
                            gameEmbed.title = `${result} beats ${choice}, You WIN ${winAmount} Alcoins!`
                            interaction.reply({ embeds: [gameEmbed], files: [resultFile]});
                        }
                        break;
                    case "scissors":
                        if (result === 'rock') {
                            winAmount -= betAmount;
                            gameEmbed.title = `${result} beats ${choice}, You lost ${winAmount}.`
                            interaction.reply({ embeds: [gameEmbed], files: [resultFile]});
                        } else if (result === 'paper') {
                            winAmount += betAmount;
                            gameEmbed.title = `${result} beats ${choice}, You WIN ${winAmount} Alcoins!`
                            interaction.reply({ embeds: [gameEmbed], files: [resultFile]});
                        }
                        break;
                }
                if (winAmount != 0) {
                    util.dataHandler.getDatabase().run(
                      "UPDATE DiscordUserData SET Currency = Currency + ? WHERE UserId = ?",
                      [winAmount, userId]);
                }
        
                return;
            }
        });
    }
};