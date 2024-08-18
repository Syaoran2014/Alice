const { SlashCommandBuilder } = require("discord.js");
const { hourlyCooldown } = require(`../activity/work`);

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Command used for testing items in development."),
    execute: async function (interaction, util) {
        if (interaction.user.id !== '129421280536428545'){
            await interaction.reply({

                content: "Nothing in testing! Try again later (*^ ‿ <*)♡ ",
            });
        }
        const now = new Date();
        const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0); 

        const timeToNextHour = nextHour.getTime() - now.getTime();
        
        await interaction.reply(`${hourlyCooldown.size}`);

        //await hourlyCooldown.clear();


        return await interaction.channel.send(`${now}\n${nextHour}\n${timeToNextHour}\nMap Size: ${hourlyCooldown.size}`);



    },

    callback: async function (msg, args, util) {
    },
};
