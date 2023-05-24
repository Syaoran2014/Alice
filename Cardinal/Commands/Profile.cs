using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Discord;
using Discord.Commands;
using Cardinal.Core;

namespace Cardinal.Commands
{
    public class Profile : ModuleBase<SocketCommandContext>
    {
        public DateTime bday;
        public int Cexp, CLvl, CLvlExp, VipExp;
        [Command("profile")]
        [Summary("Shows discord guild profile.")]
        public async Task ProfileAsync()
        {
            var user = Context.Message.Author;
            bday = DataHandler.getBirthday(user.Id);
            Cexp = XpService.GetXp(user.Id);
            CLvl = XpService.GetLevel(user.Id);
            CLvlExp = XpService.GetLevelXp(user.Id);
            VipExp = DataHandler.getVipExp(user.Id);
            var embed = new EmbedBuilder { };
            embed.WithTitle("VIP Tier X")
                .WithDescription($"Birthday: {bday.ToString("MM/dd/yyyy")}")
                .AddField("VIP Lvl ?", $"VIP Exp: {VipExp}")
                .AddField("Alcoholic Level ??", "?/? Exp")
                .AddField($"Chat L:{CLvl}", $"Exp {Cexp}/{CLvlExp}")
                .WithAuthor(user)
                .WithCurrentTimestamp();


            await Context.Channel.SendMessageAsync("", false, embed: embed.Build());
        }
        [Command("profile")]
        [Summary("Shows discord guild profile.")]
        public async Task ProfileAsync(IGuildUser user)
        {
            bday = DataHandler.getBirthday(user.Id);
            Cexp = XpService.GetXp(user.Id);
            CLvl = XpService.GetLevel(user.Id);
            CLvlExp = XpService.GetLevelXp(user.Id);
            VipExp = DataHandler.getVipExp(user.Id);
            var embed = new EmbedBuilder { };
            embed.WithTitle("VIP Tier ??")
                .WithDescription($"Birthday: {bday.ToString("MM/dd/yyyy")}")
                .AddField("VIP Lvl ?", $"VIP Exp: {VipExp}")
                .AddField("Alcoholic Level ??", "?/? Exp")
                .AddField($"Chat L:{CLvl}", $"Exp: {Cexp}/{CLvlExp}")
                .WithAuthor(user)
                .WithCurrentTimestamp();

            await Context.Channel.SendMessageAsync("", false, embed: embed.Build());
        }
    }
}
