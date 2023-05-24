using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cardinal.Core;
using Discord;
using Discord.Commands;

namespace Cardinal.Commands
{
    [RequireUserPermission(GuildPermission.BanMembers, Group = "Permission")]
    public class Ban : ModuleBase<SocketCommandContext>
    {
        [Command("Ban")]
        [Summary("Ban's a user.")]
        public async Task BanAsync(IGuildUser user)
        {
            string reason = $"Banned by {Context.Message.Author}, No reason given";
            await Context.Guild.AddBanAsync(user);
            var embed = EmbedHandler.CreateEmbed($"User {user.Username}#{user.Discriminator} Banned", $"**Reason**: {reason}");
            await Context.Channel.SendMessageAsync("", false, embed);
        }
        [Command("Ban")]
        [Summary("Ban's a user.")]
        public async Task BanAsync(IGuildUser user, [Remainder]string reason)
        {
            await Context.Guild.AddBanAsync(user);
            var embed = EmbedHandler.CreateEmbed($"User {user.Username}#{user.Discriminator} Banned", $"**Reason**: {reason}");
            await Context.Channel.SendMessageAsync("", false, embed);
        }
    }
}
