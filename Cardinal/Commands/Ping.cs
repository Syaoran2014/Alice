using System.Diagnostics;
using System.Threading.Tasks;
using Discord.Commands;

namespace Cardinal.Commands
{
    public class Ping : ModuleBase<SocketCommandContext>
    {
        [Command("ping")]
        [Summary("Tests Latency to API Socket")]
        public async Task PingAsync()
        {
            var timer = Stopwatch.StartNew();
            var msg = await Context.Channel.SendMessageAsync("Pong").ConfigureAwait(false);
            timer.Stop();
            msg.DeleteAsync();
            await Context.Channel.SendMessageAsync($"**{Context.Message.Author}** Pong! {timer.ElapsedMilliseconds}MS ");
        }
    }
}
