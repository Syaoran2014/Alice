module.exports = {
    discordPlayer: {
        ytdlOptions: {
            quality: 'highestaudio',
            filter: (form => {
                //guildmember is Undefined.... but it works? maybe?
                if (form.bitrate && guildMember.voice.channel?.bitrate) return form.bitrate <= guildMember.voice.channel.bitrate;
                return false;
            }),
            highWaterMark: 1 << 25
        }
    }
};