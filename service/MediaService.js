const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { SpotifyExtractor } = require('@discord-player/extractor'); 

class MediaService {
    constructor(util) {
        this.util = util;
        this.player = new Player(util.bot);
        //const player = new Player(util.bot)

        //await player.extractors.loadDefault((ext));
        this.player.events.on('playerStart', ( queue, track ) => {
            return;
            //queue.metadata.channel.send(`Started playing **${track.title}**!`);
        }); 

        this.player.events.on('playerError', ( queue, error, track ) => {
            queue.metadata.channel.send(`Error playing this audio track,\n${error}`);  
        });

        this.player.events.on('error', (queue, error) => {
            queue.metadata.channel.send(`Error in the queue,\n${error}`);
        });

        //t his.player.events.on('debug', (queue, message) => { this.util.logger.debug(`${queue.guild.id} ${message}`)});
    }

    async initialize(){
        try {
            //await this.player.extractors.loadDefault((ext) => ext !== null);
            await this.player.extractors.register(YoutubeiExtractor, { authentication: this.util.config.youtubeOauthToken });
            await this.player.extractors.register(SpotifyExtractor, {});
        } catch (error) {
            this.util.logger.log('Failed to initialize MediaService:', error);
        }

        //Update 
        // this.player.events.on('playerStart', (queue, track) => {
        //     queue.metadata.channel.send(`Started playing ***${track.title}***`);
        // });
    }

    nowPlayingEmbed(util, queue){
        const track = queue.currentTrack;
        const embed = {
            color: parseInt("eeb1b1", 16),
            thumbnail: {
                url: track.thumbnail
            },
            author: {
                name: `Now Playing:`,
                icon_url: util.bot.user.displayAvatarURL({size: 1024, dynamic: true}),
            },
            description: `**Title: ${track.title}\n**Artist:** ${track.author}`,
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

        return embed;
    }


}

module.exports = MediaService;
