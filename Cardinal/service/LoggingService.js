class LoggingService {
  constructor(util) {
    this.util = util;

    this.util.bot.on(this.util.lib.Events.MessageDelete, async (message) => {
      if (message.author.bot || !message.guild) {
        return;
      }

      this.util.dataHandler.getGuildConfig(
        message.guildId,
        (err, guildInfo) => {
          if (err) {
            this.util.logger.error(err.message);
            return;
          }

          if (!guildInfo.LogEnabled) {
            return;
          }

          const loggingChannel = this.util.bot.channels.cache.get(
            guildInfo.LogChannel
          );

          const embed = {
            color: parseInt("f0ccc0", 16),
            author: {
              name: message.author.username,
              icon_url: message.author.avatarURL(),
            },
            title: `Message Deleted in ${message.channel}`,
            description: `***Content:*** ${message.content}`,
          };

          loggingChannel.send({ embeds: [embed] });
        }
      );
    });

    this.util.bot.on(
      this.util.lib.Events.MessageUpdate,
      async (oldMessage, newMessage) => {
        if (oldMessage.author.bot || !oldMessage.guild) {
          return;
        }

        this.util.dataHandler.getGuildConfig(
          oldMessage.guildId,
          (err, guildInfo) => {
            if (err) {
              this.util.logger.error(err.message);
              return;
            }

            if (!guildInfo.LogEnabled) {
              return;
            }

            const loggingChannel = this.util.bot.channels.cache.get(
              guildInfo.LogChannel
            );

            const embed = {
              color: parseInt("f0ccc0", 16),
              author: {
                name: newMessage.author.username,
                icon_url: newMessage.author.avatarURL(),
              },
              title: `Message edited in ${newMessage.channel}`,
              description: `***Old Message:*** ${oldMessage.content} \n ***New Message:*** ${newMessage.content}`,
            };

            loggingChannel.send({ embeds: [embed] });
          }
        );
      }
    );
  }
}

module.exports = LoggingService;
