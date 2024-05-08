const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    category: 'miscellaneous',
    data: new SlashCommandBuilder()
      .setName("roll")
      .setDescription("Rolls some dice")
      .addStringOption(option => option
          .setName('dice')
          .setDescription('The type of dice you want to roll.')
          .addChoices(
              { name: 'd4', value: '4' },
              { name: 'd6', value: '6' },
              { name: 'd8', value: '8' },
              { name: 'd10', value: '10' },
              { name: 'd12', value: '12' },
              { name: 'd20', value: '20' },
              { name: 'd100', value: '100' }
              )
          .setRequired(true))
      .addNumberOption(option => option
          .setName('amount')
          .setDescription('The amount of dice you want to roll')),
    execute: async function(interaction, util) {
        const amount = interaction.options.getNumber('amount') ?? 1 ;
        const dice = parseInt(interaction.options.getString('dice'));
        let totalList = [];
        let total = 0;

        for (let i = 0; i < amount; i++){
            let result = Math.floor(Math.random() * dice) + 1;
            total += result;
            totalList.push(result);
        }

        return interaction.reply({ content: `You rolled ${amount}d${dice}\nTotal: ${total}\n Your rolls were: ${JSON.stringify(totalList)}` });
    },
    callback: async function(msg, args, util) {}
};
