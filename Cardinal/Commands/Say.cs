using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Discord.Commands;

namespace Cardinal.Commands
{
    [RequireUserPermission(Discord.GuildPermission.MentionEveryone, Group = "Permission")]
    public class Say : ModuleBase<SocketCommandContext>
    {
        [Command("Say")]
        [Summary("Repeats what a user says.")]
        public async Task SayAsync([Remainder]string echo)
        {
            DateTime dt = DateTime.Parse(echo);
            Console.WriteLine($"{dt:yyyy-MM-d}");
            await Context.Message.DeleteAsync();
            await ReplyAsync(echo);
        }

        
    }
}
