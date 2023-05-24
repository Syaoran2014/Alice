using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cardinal.Core;
using System.Threading.Tasks;
using Discord.Commands;
using Discord;

namespace Cardinal.Commands
{
    [RequireUserPermission(GuildPermission.KickMembers, Group = "Permission")]
    public class Kick : ModuleBase<SocketCommandContext>
    {
        [Command("Kick")]
        [Summary("Kicks a user from the discord")]
        public async Task KickUserAsync(IGuildUser user)
        {
            string reason = $"Kicked by: {Context.Message.Author}, No reason given.";
            await Context.Guild.GetUser(user.Id).KickAsync(reason);
            var embed = EmbedHandler.CreateEmbed($"User {user.Username}#{user.Discriminator} Kicked", $"**Reason**: {reason}");
            await Context.Channel.SendMessageAsync("", false, embed);
        }
        [Command("Kick")]
        [Summary("Kicks a user from the discord")]
        public async Task KickUserAsync(IGuildUser user, [Remainder]string reason)
        {
            await Context.Guild.GetUser(user.Id).KickAsync(reason);
            var embed = EmbedHandler.CreateEmbed($"User {user.Username}#{user.Discriminator} Kicked", $"**Reason**: {reason}");
            await Context.Channel.SendMessageAsync("", false, embed);
        }
    }
}
