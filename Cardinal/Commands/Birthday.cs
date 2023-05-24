using Discord.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cardinal.Core;
using Discord;

namespace Cardinal.Commands
{
    public class Birthday : ModuleBase<SocketCommandContext>
    {
        [Command("Birthday"), Alias("bday")]
        public async Task BirthdayAsync(string bday)
        {
            var formats = new[] {"M/d/yyyy", "MM/d/yyyy", "M/dd/YYYY", "MM/dd/yyyy" };
            DateTime dt;
            if (DateTime.TryParseExact(bday, formats, null, System.Globalization.DateTimeStyles.None, out dt))
            {
                var user = Context.Message.Author;
                DataHandler.SetBirthday(user.Id, dt);
                await Context.Channel.SendMessageAsync($"{user.Username}'s birthday was updated to {bday}");
            }
            else
            {
                await Context.Channel.SendMessageAsync("Invalid Birthday, Correct format MM/DD/YYYY");
            }
        }
        [Command("Birthday"), Alias("bday")]
        [RequireUserPermission(GuildPermission.ManageGuild, Group = "Permission")]
        public async Task BirthdayAsyn(IGuildUser user, string bday)
        {
            var formats = new[] { "M/d/yyyy", "MM/d/yyyy", "M/dd/YYYY", "MM/dd/yyyy" };
            DateTime dt;
            if (DateTime.TryParseExact(bday, formats, null, System.Globalization.DateTimeStyles.None, out dt))
            {
                DataHandler.SetBirthday(user.Id, dt);
                await Context.Channel.SendMessageAsync($"{user.Username}'s birthday was updated to {bday}");
            }
            else
            {
                await Context.Channel.SendMessageAsync("Invalid Birthday, Correct format MM/DD/YYYY");
            }
        }
    }
}
