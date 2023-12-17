const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { useQueue } = require("discord-player");

const activeCollectors = new Map();

module.exports = {
    category: 'music',
    data: new SlashCommandBuilder()
      .setName("queue")
      .setDescription("Shows current song queue."),
    execute: async function(interaction, util) {
        const queue = useQueue(interaction.guild);
        let queueStart = 0;

        if(activeCollectors.has(interaction.user.id)) {
            const oldCollector = activeCollectors.get(interaction.user.id);
            oldCollector.collector.stop();
            activeCollectors.delete(interaction.user.id);

        }

        if(!queue) {
            return interaction.reply({ content: "No music is currently in queue.", ephemeral: true});
        }

        if(!queue.tracks.toArray()[0]) {
            return interaction.reply({ content: "The final song is playing, queue up now to keep to party going!", ephemeral: true});
        }

        const songs = queue.tracks.size;
        const nextSonges = songs > 5 ? `And **${songs -5}** other song(s)...` : `In the playlist **${songs} song(s)...`;
        const tracks = queue.tracks.map((track, i) => `**${i + 1 }** - ${track.title} | ${track.author} (requested by : ${track.requestedBy.username})`);

        const emebed = {
            color: parseInt("f0ccc0", 16),
            thumbnail: {
                url: interaction.guild.iconURL({ size: 2048, dynamic: true})
            },
            author: {
                name: `Server queue - ${interaction.guild.name}`,
                icon_url: util.bot.user.displayAvatarURL({ size: 1024, dynamic: true}),
            },
            description: `Now Playing: ${queue.currentTrack.title} | ${queue.currentTrack.author}\n\n${tracks.slice(0, 5).join('\n')}\n\n${nextSonges}`,
            timestamp: new Date().toISOString(),
        };
        
        const components = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('previous').setEmoji('⬅️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Primary)
            )
        ];
        await interaction.reply({ embeds: [emebed], components});

        const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000});
        activeCollectors.set(interaction.user.id, { collector: collector, queueStart: queueStart });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return; 
            }
            const userState = activeCollectors.get(interaction.user.id);
            const action = i.customId;
            try {
                switch(action){
                    case "previous":
                        if (userState.queueStart <= 5){
                            userState.queueStart = 0;
                            // if (i.user.id === `163538794388127744`) {
                            //     return i.update({ content: "Fuck you Kyle", embeds: [emebed], components: [] });
                            // } else if (i.user.id === `221736432367173632`){
                            //     return i.update({ content: "Fuck you too Joe", embeds: [emebed], components: [] });
                            // } else {
                            //     userState.queueStart = 0;
                            // }
                        } else {
                            userState.queueStart -= 5;
                        }
                        emebed.description = `Now Playing: ${queue.currentTrack.title} | ${queue.currentTrack.author}\n\n${tracks.slice(userState.queueStart, userState.queueStart + 5).join('\n')}`;
                        emebed.footer = { text: `Queue ${userState.queueStart + 1} - ${userState.queueStart + 5} of ${songs} songs`};
                        activeCollectors.set(interaction.user.id, userState);
                        await i.update({ embeds: [emebed], components});
                        break;
                    case "next": 
                        userState.queueStart += 5;
                        emebed.description = `Now Playing: ${queue.currentTrack.title} | ${queue.currentTrack.author}\n\n${tracks.slice(userState.queueStart, (userState.queueStart + 5 <= songs) ? userState.queueStart + 5 : songs).join('\n')}`;
                        emebed.footer = { text: `Queue ${userState.queueStart + 1} - ${userState.queueStart + 5} of ${songs} songs`};
                        activeCollectors.set(interaction.user.id, userState);
                        await i.update({ embeds: [emebed], components});
                        break;
                }
            } catch (err) {
                util.logger.error(`Error in collector: ${err}`);
            }
        });
        collector.on('end', async () => {
            activeCollectors.delete(interaction.user.id);
            return await interaction.editReply({ embeds: [emebed], components: []});

        });
    }
};