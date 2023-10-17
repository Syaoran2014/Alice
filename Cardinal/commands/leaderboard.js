const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Leaderboard of top user's based on chat activity."),
  execute: async function(interaction, util) {
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
        interaction.reply({ embeds: [embed] });
    })
  },
  async callback(msg, args, util) {
    msg.channel.send(
      `This command was run by ${msg.author.username}, who joined on ${msg.member.joinedAt}.`
    );
  },
};
