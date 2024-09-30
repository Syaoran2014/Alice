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
        if (msg.author.id !== '129421280536428545') return msg.reply('Nothing in testing for you! Try again later (*^ ‿ <*)♡ ');

        const confirmation = await msg.reply(`This will uppload all users' avatars to the webserver.\nDo you want to process?`);
        try {
            const filter = response => response.author.id === msg.author.id && response.content.toLowerCase() === 'yes';
            const collected = await msg.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
        } catch (err) {
            return msg.reply('Command cancelled.');
        }

        msg.reply('Starting avatar upload process...');

        const userMap = new Map();
        for (const guild of msg.client.guilds.cache.values()) {
            for (const member of guild.members.cache.values()) {
                userMap.set(member.user.id, member.user);
            }
        }

        const users = Array.from(userMap.values());

        const batchSize = 10;
        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize); 

            await Promise.all(batch.map(user => uploadUserAvatar(user, util)));

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        msg.reply('Avatar upload process completed.');
    },
};


async function uploadUserAvatar(user, util) {
    if (!user.avatar) return;

    try {
        const uploadPath = `/avatars/${user.id}/${user.avatar}.png`;
        const avatarURL = user.displayAvatarURL({ format: 'png', size: 1024 });

        const response = await util.axios.get(avatarURL, { responseType: 'arraybuffer' });
        const avatarData = response.data;
        const formData = new util.FormData();
        formData.append('file', avatarData, {filename: `${user.avatar}.png` });
        formData.append('path', uploadPath);

        await util.axios.post('https://alice.stardawn.gg/upload', formData, {
            headers: {
                'Authorization': `Bearer ${util.config.httpToken}`,
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        util.logger.log(`Uploaded avatar for user ${user.username}: ${user.id}`);
    } catch (err) {
        util.logger.error(`Failed to upload avatar for user ${user.username}: ${user.id} ${err.message}`);
    }
}
