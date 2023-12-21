const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Leaderboard of top user's based on chat activity.")
    .addStringOption(option => option
      .setName("boardtype")
      .setDescription("Leaderboard type")
      .setRequired(false)
      .addChoices(
        { name: 'Experience', value: 'exp'},
        { name: 'Currency', value: 'cur'}
      )),
  execute: async function(interaction, util) {
    const userChoice = interaction.options.getString('boardtype');
    const choice = userChoice ? userChoice : "exp";
    
    util.logger.log(`${userChoice}, ${choice}`);
    switch(choice) {
      case "exp":
        util.dataHandler.getTopUsers(10, (err, topUsers) => {
          if (err) {
              this.util.logger.error(err.message);
              return interaction.reply({
                  content: "Something went wrong while fetching the leaderboard. Please try again later.",
              });
          }
          const embed = {
              color: parseInt("f0ccc0", 16),
              title: "Top 10 Users by Experience",
              fields: topUsers.map((user, index) => ({
                  name: `${index + 1}. ${user.UserName}`,
                  value: `Level ${user.ChatLvl} - Xp: ${user.ChatExp}/${user.LevelXp}`
              })),
          };
          return interaction.reply({ embeds: [embed] });  
        });
        break;
      case "cur":
        util.dataHandler.getTopCurrencyUsers(10, (err, topUsers) => {
          if (err) {
            this.util.logger.error(err.message);
            return interaction.reply({
                content: "Something went wrong while fetching the leaderboard. Please try again later.",
            });
        }
        const embed = {
            color: parseInt("f0ccc0", 16),
            title: "Top 10 Users by Currency",
            fields: topUsers.map((user, index) => ({
                name: `${index + 1}. ${user.UserName}`,
                value: `${user.Currency} Alcoins.`
            })),
        };
        return interaction.reply({ embeds: [embed] });  
        });
        break;
    }
  },
  async callback(msg, args, util) {
    msg.channel.send(
      `This command was run by ${msg.author.username}, who joined on ${msg.member.joinedAt}.`
    );
  },
};
