using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Discord;

namespace Cardinal.Core
{
    public static class EmbedHandler
    {
        public static Embed CreateEmbed(string title, string description)
        {
            var embed = new EmbedBuilder()
                .WithTitle(title)
                .WithDescription(description)
                .WithCurrentTimestamp()
                .Build();

            return embed;
        }

        public static Embed CreateEmbed(string title, string description, string fieldContent, string fieldContent2, Color color)
        {
            var embed = new EmbedBuilder()
                .WithTitle(title)
                .WithDescription(description)
                .AddField(fieldContent, fieldContent2)
                .WithColor(color)
                .WithCurrentTimestamp()
                .Build();

            return embed;
        }
    }
}
