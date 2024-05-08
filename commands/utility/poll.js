const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const pollMap = new Map();

module.exports = {
    category: 'utility',
    pollMap,
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll with options')
        .addStringOption(option => option
            .setName('question')
            .setDescription('The question for the poll')
            .setRequired(true))
        .addStringOption(option => option
            .setName('options')
            .setDescription('Comma sepearated list of poll options. Example "Option one, Option two, Option 3')
            .setRequired(true))
        .addStringOption(option => option
            .setName('time')
            .setDescription('How long you want to track result')
            .addChoices(
                { name: '1 Hour', value: '3600000' },
                { name: '6 Hours', value: '21600000' },
                { name: '12 Hours', value: '43200000' },
                { name: '1 Day', value: '86400000' },
                { name: '1 Week', value: '604800000' })
            .setRequired(true))
        .addBooleanOption(option => option
            .setName('anonymous')
            .setDescription('Should the poll be anonymous?')
            .setRequired(false))
        .addBooleanOption(option => option
            .setName('unique')
            .setDescription('Limit votes to one per poll?')
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: async function(interaction, util) {
        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options').split(',');
        const duration = parseInt(interaction.options.getString('time'));
        const anonymous = interaction.options.getBoolean('anonymous') || false;
        const unique = interaction.options.getBoolean('unique') || false;
        
        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

        const endTime = new Date(Date.now() + duration);
        const formatEndTime = endTime.toLocaleString('en-US', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
        });
            


        const embed = new EmbedBuilder()
            .setColor(0xf0ccc0)
            .setTitle(question)
            .setDescription(options.map((opt, i) => `${numberEmojis[i]}: ${opt}`).join('\n'))
            .setFooter({ text: unique ? `Only one vote this poll will count\nEnd Time: ${formatEndTime}` : `Multiple votes will be counted\nEnd Time ${formatEndTime}` });    

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        const voteCounts = new Map(options.map((_, i) => [numberEmojis[i], 0]));
        const userVotes = new Map();

        for (const reaction of numberEmojis.slice(0, options.length)) {
            await message.react(reaction);
        }

        const filter = (reaction, user) => numberEmojis.includes(reaction.emoji.name) && !user.bot;
        const collector = message.createReactionCollector({ filter, time: duration, dispose: true });

        pollMap.set(message.id, { collector, voteCounts, userVotes });

        collector.on('collect', (reaction, user) => {
            const votes = userVotes.get(user.id) || new Set();
            if(anonymous) {
                reaction.users.remove(user.id);
                if(votes && votes.has(reaction.emoji.name)) {
                    voteCounts.set(reaction.emoji.name, (voteCounts.get(reaction.emoji.name) || 0) - 1);
                    votes.delete(reaction.emoji.name);
                    return;

                }
            }

            if(unique && votes.size > 0 && !votes.has(reaction.emoji.name)) {
                votes.forEach(vote => {
                    if(vote !== reaction.emoji.name) {
                        voteCounts.set(vote, voteCounts.get(vote) - 1);
                        message.reactions.resolve(vote).users.remove(user.id);
                    }
                });
                votes.clear();
            }
            if(!votes || !votes.has(reaction.emoji.name)) {
                votes.add(reaction.emoji.name);
                userVotes.set(user.id, votes);
                voteCounts.set(reaction.emoji.name, (voteCounts.get(reaction.emoji.name) || 0) + 1); 
            }
        });
        
        collector.on('remove', (reaction, user) => {
            if(!anonymous) {
                const votes = userVotes.get(user.id);
                if(votes && votes.has(reaction.emoji.name)) {
                    votes.delete(reaction.emoji.name);
                    voteCounts.set(reaction.emoji.name, (voteCounts.get(reaction.emoji.name) || 0) - 1);
                    if (votes.size === 0) {
                        userVotes.delete(user.id);
                    }
                }
            }
        });
        collector.on('end', () => {
            const results = Array.from(voteCounts.entries()).map(([emoji, count]) => {
                const percentage = voteCounts.size > 0 ? (count / Array.from(voteCounts.values()).reduce((acc, cur) => acc + cur) * 100).toFixed(2) : 0;
                return `${emoji}: ${count} votes (${percentage}%)`;
            }).join('\n');

            embed.addFields({ name: `Results`, value: results });
            message.edit({ embeds: [embed] }); 
            pollMap.delete(message.id);
        });
    },
    callback: async function(msg, args, util) {},
};
