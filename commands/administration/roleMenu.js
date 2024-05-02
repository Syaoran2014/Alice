const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    category: 'administration',
    data: new SlashCommandBuilder()
      .setName('rolemenu')
      .setDescription('Sets up or Modifies a reactable role menu')
      .addSubcommand(subcommand => subcommand
          .setName('setup')
          .setDescription('Sets up a new role menu')
          .addStringOption(option => option.setName('title').setDescription('Optional title to name the role menu').setRequired(true)))
      .addSubcommand(subcommand => subcommand
          .setName('edit')
          .setDescription('Edits an existing role menu')
          .addStringOption(option => option.setName('messageid').setDescription('MessageId of the Role menu you want to edit').setRequired(true))),
    execute: async function(interaction, util) {
        const subcommand = interaction.options.getSubcommand();

        switch(subcommand) {
            case 'setup':
                await handleSetupMenu(interaction, util);
                break;
            case 'edit':
                await handleEditMenu(interaction, util);
                break;
            default:
                await interaction.reply({ content: 'Unhandled Command, Please try again with the correct parameters', ephemeral: true });
                break;
        }
    },
    callback: async function(msg, args, util) {}
};

async function handleSetupMenu(interaction, util) {
    const titleOption = interaction.options.getString('title');
    const title = titleOption ? `${titleOption}` : `Default`;
    const embed = new EmbedBuilder().setTitle('Role Menu Setup!').setColor(parseInt("f0ccc0", 16));

    const message = await interaction.reply({ content: `Send a message with an Emoji and @Role\nExample: :white_check_mark: <@&429342178859548682>\nReply 'done' to finish setup`, embeds: [embed], fetchReply: true });
    const filter = (resp) => resp.author.id === interaction.user.id;

    const collector = interaction.channel.createMessageCollector({ filter, time: 600000 }); 

    let roleMenuConfig = {};

    collector.on('collect', async (resp) => {
        if(resp.content.toLowerCase() === 'done') {
            embed.setTitle(title);
            message.edit({ content: "", embeds: [embed] });
            collector.stop();
            return;
        }

        const parts = resp.content.split(' ');
        if (parts.length === 2){
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
        const configPath = path.join(__dirname, '../../data/roleMenuConfig.json');
        let existingConfig = {};

        if(fs.existsSync(configPath)) {
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

async function handleEditMenu(interaction, util) {
    const messageId = interaction.options.getString('messageid');
    const configPath = path.join(__dirname, '../../data/roleMenuConfig.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const serverId = interaction.guild.id;
    const channelId = interaction.channelId;

    // Check if the message exists in the config
    if (!config[serverId][channelId][messageId]) {
        await interaction.reply({ content: 'No role menu found with the given message ID.', ephemeral: true });
        return;
    }

    const channel = await interaction.channel;
    const message = await channel.messages.fetch(messageId);

    const save = new ButtonBuilder()
        .setCustomId('saveChanges')
        .setLabel('Save')
        .setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder()
        .setCustomId('discardChanges')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(save, cancel);

    const originalEmbedData = message.embeds[0].toJSON();
    const embed = new EmbedBuilder()
        .setTitle(originalEmbedData.title)
        .setDescription(originalEmbedData.description)
        .setColor(originalEmbedData.color);    
    
    const newMessage = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
    
    // React to the new message with all registered emojis
    let roleMenuConfig = config[serverId][channelId][messageId];
    Object.keys(roleMenuConfig).forEach(async (emoji) => {
        await newMessage.react(emoji);
    });

    const filter = (reaction, user) => !user.bot;
    const reactionCollector = newMessage.createReactionCollector({ filter, time: 600000 });
    const buttonCollector = newMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

    reactionCollector.on('collect', async (reaction, user) => {
        const roleEmoji = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
        if(roleMenuConfig[roleEmoji]) {
            delete roleMenuConfig[roleEmoji];
            const description = roleMenuDescription(roleMenuConfig); 
            embed.setDescription(description);
            await newMessage.edit({ embeds: [embed] });
            await reaction.message.reply({ content: `Removed role linked to ${reaction.emoji}.`, ephemeral: true });
        } else {
            await reaction.message.reply({ content: `Which role should be linked with ${reaction.emoji}? \nReply with the role ID or @mention the role.`, fetchReply: true}).then(roleReply => {
                const roleCollector = roleReply.channel.createMessageCollector({ filter: message => message.author.id == user.id, time: 60000, max: 1 });

                roleCollector.on('collect', async (message) => {
                    const roleId = message.content.match(/\d+/); 
                    if(roleId) {
                        roleMenuConfig[roleEmoji] = roleId;
                        const description = roleMenuDescription(roleMenuConfig);
                        embed.setDescription(description); 
                        await newMessage.edit({ embeds: [embed] });
                        await roleReply.reply({ content: `Linked ${reaction.emoji} with <@&${roleId}>`, ephemeral: true});
                    } else {
                        await roleReply.reply({ content: `Invalid role Id. No changes made.`, ephemeral: true });
                    }
                });

                roleCollector.on('end', async collected => {
                    if (collected.size === 0) {
                        await roleReply.reply({ content: `No role ID provided. No Changes made.`, ephemeral: true });
                    }
                });
            });
        }
    });

    // reactionCollector.on('end', async () => {
    // });

    buttonCollector.on('collect', async buttonInteraction => {
        if(buttonInteraction.user.id !== interaction.user.id) {
            await buttonInteraction.reply({ content: 'You cannot modify this role menu.', ephemeral: true });
            return;
        }

        if(buttonInteraction.customId === 'saveChanges') {
            config[serverId][channelId][messageId] = roleMenuConfig;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            const description = roleMenuDescription(roleMenuConfig);
            embed.setDescription(description); 
            await message.edit({ embeds: [embed] }); 

            await message.reactions.removeAll();
            Object.keys(roleMenuConfig).forEach(async (emoji) => {
                await message.react(emoji);
            });
            reactionCollector.stop();
            buttonCollector.stop();
        }
        if(buttonInteraction.customId === 'discardChanges') {
            reactionCollector.stop();
            buttonCollector.stop();
        }

    });

    buttonCollector.on('end', () => {
        newMessage.delete();
        interaction.channel.send({ content: `You may now delete any undeleted messages`, ephemeral: true });
    });

}

function roleMenuDescription(roleConfig) {
    let output = '';
    Object.keys(roleConfig).forEach(key => {
        const roles = roleConfig[key].map(roleId => `<@&${roleId}>`).join(', ');
        output += `${key}: ${roles}\n`;
    });
    return output;
}
