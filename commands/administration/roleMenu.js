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
          .addStringOption(option => option.setName('messageid').setDescription('MessageId of the Role menu you want to edit').setRequired(true))
          .addStringOption(option => option.setName('title').setDescription('The title you want to change the role menu to'))),
    execute: async function(interaction, util) {
        const subcommand = interaction.options.getSubcommand();

        switch(subcommand) {
            case 'setup':
                await handleSetupNew(interaction, util);
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

async function handleSetupNew(interaction, util) {
    const titleOption = interaction.options.getString('title');
    const title = titleOption ? `${titleOption}` : 'Default';
    const serverId = interaction.guild.id; 
    const channelId = interaction.channelId;

    const embed = new EmbedBuilder()
      .setTitle('Role Menu Setup!')
      .setColor(parseInt("f0ccc0", 16));

    const save = new ButtonBuilder().setCustomId('save').setLabel('Save').setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(save, cancel);

    let roleMenuConfig = {};
    
    const menuMessage = await interaction.reply({ content: `***React to this message to add a Role***`, embeds: [embed], components: [row], fetchReply: true });
    const filter = (reaction, user) => !user.bot || user.id === interaction.user.id;

    const reactionCollector = menuMessage.createReactionCollector({filter, time: 600000 });
    const buttonCollector = menuMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

    reactionCollector.on('collect', async (reaction, user) => {
        const roleEmoji = reaction.emoji;
        await reaction.message.reply({ content: `Which role should be linked with ${reaction.emoji}?\nReply with the roleID or @mention the role.\n**Note:** If you do not see the emoji in this message, I'm not able to use it.`, fetchReply: true}).then(roleReply => {
            const roleCollector = roleReply.channel.createMessageCollector({ filter: message => message.author.id == user.id, time: 60000, max: 1 });

            roleCollector.on('collect', async (message) => {
                const roleId = message.content.match(/\d+/);
                if(roleId) {
                    roleMenuConfig[roleEmoji] = roleId;
                    const description = roleMenuDescription(roleMenuConfig);
                    embed.setDescription(description);
                    await menuMessage.edit({ embeds: [embed] });
                    await roleReply.reply({ content: `Linked ${reaction.emoji} with <@&${roleId}>`, ephemeral: true });
                } else {
                    await roleReply.reply({ content: `Invalid role id. no changes were made.`, ephemeral: true });
                }
            });

            roleCollector.on('end', async collected => {
                if (collected.size === 0) {
                    await roleReply.reply({ content: `No role id provided. No changes were made.`, ephemeral: true });
                }
            });
        });    
    });

    buttonCollector.on('collect', async buttonInteraction => {
        if(buttonInteraction.user.id !== interaction.user.id) {
            await buttonInteraction.reply({ content: 'You cannot modify this role menu.', ephemeral: true });
            return;
        }

        if(buttonInteraction.customId === 'save') {
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
            existingConfig[serverId][channelId][menuMessage.id] = roleMenuConfig;

            fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
            reactionCollector.stop();
            buttonCollector.stop();
            embed.setTitle(title);
            await menuMessage.edit({ content: "", embeds: [embed], components: [] }); 

            Object.keys(roleMenuConfig).forEach(async (emoji) => {
                await menuMessage.react(emoji);
            });

            await interaction.followUp({ content: 'Role menu setup complete.\nYou can now delete your messages!', ephemeral: true });
        }
        if(buttonInteraction.cusomId === 'cancel'){
            reactionCollector.stop();
            buttonCollector.stop();
        }
    });
};

async function handleEditMenu(interaction, util) {
    const messageId = interaction.options.getString('messageid');
    const configPath = path.join(__dirname, '../../data/roleMenuConfig.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const serverId = interaction.guild.id;
    const channelId = interaction.channelId;

    const titleOption = interaction.options.getString('title');

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

    if(titleOption) embed.setTitle(titleOption);

    const newMessage = await interaction.reply({ content: `To add a role to the menu: React to this message.\nTo Remove a role from the menu, react on the existing emote`, embeds: [embed], components: [row], fetchReply: true });
    
    // React to the new message with all registered emojis
    let roleMenuConfig = config[serverId][channelId][messageId];
    Object.keys(roleMenuConfig).forEach(async (emoji) => {
        await newMessage.react(emoji);
    });

    const filter = (reaction, user) => !user.bot;
    const reactionCollector = newMessage.createReactionCollector({ filter, time: 600000 });
    const buttonCollector = newMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

    reactionCollector.on('collect', async (reaction, user) => {
        const roleEmoji = reaction.emoji;
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

            const currentReactions = message.reactions.cache;
            for (let [emoji] of currentReactions) {
                const guildEmoji = util.bot.emojis.cache.get(emoji);
                if (!roleMenuConfig[guildEmoji]) {
                    if (roleMenuConfig[emoji]) {
                        continue;
                    }
                    await currentReactions.get(emoji).remove();
                }
            }

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
