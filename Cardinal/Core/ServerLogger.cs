using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Discord;
using Discord.WebSocket;

namespace Cardinal.Core
{
    public class ServerLogger
    {
        private readonly DiscordSocketClient _client;

        public ServerLogger(DiscordSocketClient client)
        {
            _client = client;
        }

        public async Task InitiliazeLogger()
        {
            _client.MessageDeleted += HandleMessageAsync;
        }

        private async Task HandleMessageAsync(Cacheable<IMessage, ulong> messageParam, Cacheable<IMessageChannel, ulong> channel)
        {

            var optChannel = channel.Value;
            var msg = messageParam.Value;
            Console.WriteLine($"Message Deleted {msg} by {msg.Author}");
            if (msg.Author.IsBot) return;
            if (optChannel is not ITextChannel ch) return;
            var guild = ch.Guild;
            var test = await guild.GetTextChannelAsync(Program.Config.logChannel);

            var embed = EmbedHandler.CreateEmbed($"Message Deleted in #{msg.Channel}", $"Author: {msg.Author}", "Content: ", $"{msg.Content}", Color.Purple);

            await test.SendMessageAsync(embed: embed);
        }
    }
}
