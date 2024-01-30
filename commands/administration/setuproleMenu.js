const { SlashCommandBuilder, EmbedBuilder } = require("discord.js"); 
const fs = require("fs");
const path = require("path");

module.exports = {
    category: 'administration',
    data: new SlashCommandBuilder()
        .setName('setuprolemenu')
        .setDescription('Sets up new role menu.')
        .addStringOption((option) => option
            .setName('title')
            .setDescription("Optional title to name the role menu")
            .setRequired(false)),
    execute: async function(interaction, util) {
        const titleOption = interaction.options.getString('title');
        const title = titleOption ? `${titleOption} Role Menu!` : 'Role Menu!';
        const embed = new EmbedBuilder()
            .setTitle('Role Menu Setup!')
            .setColor(parseInt("f0ccc0", 16));

        //Add Making the channel private??
        
        const message = await interaction.reply({ content: `Send a message with an Emoji and @Role\nExample: :white_check_mark: <@&429342178859548682>\n Reply 'done' to finish setup`, embeds: [embed], fetchReply: true });
        const filter = (resp) => resp.author.id === interaction.user.id;
        
        //Timeout set for 10 minutes
        const collector = interaction.channel.createMessageCollector({ filter, time: 600000 }); 

        let roleMenuConfig = {};

        collector.on('collect', async (resp) => {
            if(resp.content.toLowerCase() === 'done') {
                embed.setTitle(title);
                message.edit({ content: "", embeds: [embed]});
                collector.stop();
                return;
            }

            const parts = resp.content.split(' ');
            if (parts.length === 2) {
                const emoji = parts[0];
                const roleId = parts[1].match(/\d+/);

                if (!roleId) {
                    resp.reply("Invalid role id");
                }

                roleMenuConfig[emoji] = roleId;

                let output = '';

                Object.keys(roleMenuConfig).forEach(key => {
                    const roles = roleMenuConfig[key].map(roleId => `<@&${roleId}>`).join(', ');
                    output += `${key}: ${roles}\n`;
                });

                embed.setDescription(output);
                await message.edit({ embeds: [embed] });

                await message.react(emoji);
            } else { 
                await resp.reply("Invalid format. Please use \"emoji role\".");
            }
        });

        collector.on('end', async () => {
            //Write and update the existing code somewhere. 
            const configPath = path.join(__dirname, '../../Data/roleMenuConfig.json');
            let existingConfig = {};

            if (fs.existsSync(configPath)) {
                const fileContent = fs.readFileSync(configPath, 'utf8');
                existingConfig = fileContent ? JSON.parse(fileContent) : {};
            }

            const serverId = interaction.guild.id;
            const channelId = interaction.channelId; 

            if(!existingConfig[serverId]){
                existingConfig[serverId] = {};
            }
            if(!existingConfig[serverId][channelId]) {
                existingConfig[serverId][channelId] = {}; 
            }
            existingConfig[serverId][channelId][message.id] = roleMenuConfig; 

            fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
            await interaction.followUp({ content: 'Role menu setup complete.\nYou can now delete your messages!', ephemeral: true });

        });
    }
};