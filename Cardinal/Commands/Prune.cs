using System.Threading.Tasks;
using Discord;
using Discord.Commands;

namespace Cardinal.Commands
{
    [RequireUserPermission(GuildPermission.ManageMessages, Group = "Permission")]
    public class Prune : ModuleBase<SocketCommandContext>
    {
        [Command("prune")]
        [Summary("Deletes a set amount of messages")]
        public async Task PruneAsync(int amount = 1)
        {
            var messages = await Context.Channel.GetMessagesAsync(amount + 1).FlattenAsync();
            await ((ITextChannel)Context.Channel).DeleteMessagesAsync(messages);
        }
    }
}
