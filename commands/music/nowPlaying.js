const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
      .setName("nowplaying")
      .setDescription("Shows currently playing song"),
    execute: async function(interaction, util) {
        const queue = useQueue(interaction.guild);
        let djRole = null;
        
        if(!queue) {
            return interaction.reply({ content: "No music is currently in queue.", ephemeral: true });
        }

        util.dataHandler.getGuildConfig(interaction.guildId, (err, guildInfo) => {
            if (err) {
                util.logger.error(err.message);
                return interaction.reply({ content: "Error in getting Server Configuration.\nIf issue persists, contact bot admin", ephemeral: true });
            }
            if (!guildInfo) {
                util.logger.error(`No Guild info found for ${interaction.guild}`);
                return interaction.reply({ content: "No server info was found, Contact bot admin" });
            } else {
                djRole = guildInfo.DjRole;
            }
        });
        
        const isAdmin = interaction.member.permissions.toArray().includes("Administrator");
        const isDj = interaction.member.roles.cache.has(djRole);

        const track = queue.currentTrack;
        
        //Update to be a console.
        const embed = {
            color: parseInt("f0ccc0", 16),
            thumbnail: {
               // url: interaction.guild.iconURL({ size: 2048, dynamic: true})
                url: track.thumbnail
            },
            author: {
                name: `Now Playing:`,
                icon_url: util.bot.user.displayAvatarURL({ size: 1024, dynamic: true}),
            },
            description: `**Title:** ${track.title}\n**Artist:** ${track.author}`,
            fields: [
                {
                    name: 'Requested by:',
                    value: `${track.requestedBy}`,
                    inline: true,
                },
                {
                    name: 'Duration:',
                    value: `${track.duration}`,
                    inline: true,
                },
            ],
            image: {
                url: `https://media1.tenor.com/images/b3b66ace65470cba241193b62366dfee/tenor.gif`
            }
        };

        const components = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('previous').setEmoji("\u23EE").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('playpause').setEmoji("\u23EF").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('skip').setEmoji("\u23ED").setStyle(ButtonStyle.Secondary),
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('shuffle').setEmoji("\u{1F500}").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('stop').setEmoji("\u23F9").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('test').setEmoji("\u23CF").setStyle(ButtonStyle.Secondary)
            )
        ];

        if(!isAdmin || !isDj) {
            return interaction.reply({ embeds: [embed] });
        }

        const mConsole = await interaction.reply({ embeds: [embed], components, fetchReply: true });

        const buttonCollector = mConsole.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600000 });

        buttonCollector.on('collect', async buttonInteraction => {
            if(buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({ content: 'You cannot use these buttons', ephemeral: true});
            }
            // #TODO: Allow any admin or DJ to use and console as long as they are in voicechat...

            // #TODO: Test current setup
            // I think interaction reply will error out, might need to be "buttonInteraction.reply()"
            switch(buttonInteraction.customId) {
                case "playpause":
                    break;
                case "previous":
                    break;
                case "skip":
                    const success = queue.node.skip();
                    const skippedEmbed = {
                        title: success ? `Current track ${queue.currentTrack.title} has been skipped` : `Something went wrong, please try again`,
                        color: parseInt("f0ccc0", 16),
                    };
                    return interaction.reply({ embeds: [skippedEmbed] });
                case "shuffle":
                    await queue.tracks.shuffle();
                    const shuffleEmbed = {
                        title: `Queue has shuffled ${queue.tracks.size} song(s)`,
                        color: parseInt("f0ccc0", 16),
                    };
                    return interaction.reply({ embeds: [shuffleEmbed]});
                    break;
                case "stop":
                    queue.delete();
                    const stopEmbed = {
                        title: "Music stopped, see you next time! \n(*^ ‿ <*)♡",
                        color: parseInt("f0ccc0", 16),
                    };
                    return interaction.reply({ embeds: [stopEmbed]});
                case "test":
                    break;
            }
        });
        

    }
};
