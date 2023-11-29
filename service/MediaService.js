const { Player } = require('discord-player');
const mediaConfig = require('../data/mediaConfig')

class MediaService {
    constructor(util) {
        this.util = util;
        this.player = new Player(util.bot, mediaConfig.discordPlayer);
        //const player = new Player(util.bot)

        //await player.extractors.loadDefault((ext));
    }

    async initialize(){
        try {
            await this.player.extractors.loadDefault((ext) => ext !== null);
        } catch (error) {
            this.util.logger.log('Failed to initialize MediaService:', error);
        }

        // this.player.events.on('playerStart', (queue, track) => {
        //     queue.metadata.channel.send(`Started playing ***${track.title}***`);
        // });
    }

}

module.exports = MediaService;