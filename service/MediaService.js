const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { SpotifyExtractor } = require('@discord-player/extractor'); 
const mediaConfig = require('../data/mediaConfig');

class MediaService {
    constructor(util) {
        this.util = util;
        this.player = new Player(util.bot, mediaConfig.discordPlayer);
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
    }

    async initialize(){
        try {
            //await this.player.extractors.loadDefault((ext) => ext !== null);
            await this.player.extractors.register(YoutubeiExtractor, { authentication: this.util.config.youtubeOauthToken });
            //await this.player.extractors.register(SpotifyExtractor, {});
        } catch (error) {
            this.util.logger.log('Failed to initialize MediaService:', error);
        }

        //Update 
        // this.player.events.on('playerStart', (queue, track) => {
        //     queue.metadata.channel.send(`Started playing ***${track.title}***`);
        // });
    }


}

module.exports = MediaService;
