using Discord;
using Discord.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cardinal.Core;

namespace Cardinal.Commands
{
    [Group("Exp")]
    [RequireUserPermission(GuildPermission.ManageGuild, Group = "Permission")]
    public class ExperienceModule : ModuleBase<SocketCommandContext>
    {
        [Group("VIP")]
        public class VipModule : ModuleBase<SocketCommandContext>
        {
            [Command("add")]
            [Summary("Adds VIP experience to a user")]
            public async Task addVipExp(IGuildUser user, int exp)
            {
                DataHandler.addVIPExp(user.Id, exp);
                await Context.Channel.SendMessageAsync($"Added {exp} Vip Exp to {user.Username}");
            }
            [Command("set")]
            [Summary("Sets VIP experience to a user")]
            public async Task setVipExp(IGuildUser user, int exp)
            {
                DataHandler.setVIPExp(user.Id, exp);
                await Context.Channel.SendMessageAsync($"Set {exp} Vip Exp to {user.Username}");
            }
        }





/*        [Command("Experience"), Alias("xp")]
        public async Task ExperienceAsync([Remainder] IUser user = null)
        {
            user = user ?? Context.User;
            var mentionedUser = Context.Message.MentionedUserIds.FirstOrDefault();
            ulong UserID = user.Id;
            await Context.Channel.SendMessageAsync($"**{user.Username}**: {XpService.GetXp(UserID)}/{XpService.GetLevelXp(UserID)}");
        }*/
    }
}
