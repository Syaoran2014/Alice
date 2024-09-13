const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    category: 'miscellaneous', 
    data: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Sends a suggestion privately to the bot owner")
        .addStringOption(option => option
            .setName('suggestion')
            .setDescription('What you are suggesting to be improved or added')
            .setRequired(true)),
    execute: async function(interaction, util) {
        const suggestion = interaction.options.getString('suggestion');

        const owner = await util.bot.users.fetch(util.config.ownerId);

        const suggestionEmbed = {
            color: 0xeeb1b1,
            author: {
                name: `${interaction.user.username} - ID: ${interaction.user.id}`,
                icon_url: interaction.user.displayAvatarURL({size: 1024, dynamic: true}),
            },
            title: `New Suggestion received`, 
            description: suggestion,
            fields: [],
            footer: {
                text: `${interaction.createdAt}`
            },
        };

        await owner.send({ embeds: [suggestionEmbed] });
        return await interaction.reply({ content: `Suggestion Sent`, ephemeral: true });
    },
    callback: async function(msg, args, util){
        if(args.length < 1) return msg.channel.send(`Please add a suggestion after the command`);
        const suggestion = args.join(" ");

        const owner = await util.bot.users.fetch(util.config.ownerId);

        const suggestionEmbed = {
            color: 0xeeb1b1,
            author: {
                name: `${msg.author.username} - ID: ${msg.author.id}`,
                icon_url: msg.author.displayAvatarURL({size: 1024, dynamic: true}),
            },
            title: `New Suggestion received`, 
            description: suggestion,
            fields: [],
            footer: {
                text: `${msg.createdAt}`
            },
        };

        await owner.send({ embeds: [suggestionEmbed] });
        return msg.react('✅');
    }
};

