using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cardinal.Core;
using Discord;
using Discord.Commands;
using Discord.Interactions;
using Discord.WebSocket;

namespace Cardinal.Commands
{
	[Discord.Commands.Group("Help")]
	public class HelpModule : ModuleBase<SocketCommandContext>
	{
		private readonly CommandService _commands;

		public HelpModule(CommandService commands)
		{
			_commands = commands;
		}

		[Command]
		[Discord.Commands.Summary("Displays all available commands")]
		public async Task HelpAsync()
		{
			
			var user = Context.User;
			var embedBuilder = new EmbedBuilder()
				.WithColor(Color.Purple)
				.WithTitle($"{user.Username} Command List");


            foreach (var module in _commands.Modules)
			{
				if (!module.Attributes.Any(a => a is HideAttribute))
				{
                    var commandList = new StringBuilder();
                    foreach (var command in module.Commands)
					{
						if (!command.Attributes.Any(a => a is HideAttribute))
						{
							var parameters = string.Join(" ", command.Parameters.Select(p => $"[{p.Name}]"));
							commandList.AppendLine($"'{command.Aliases.First()} {parameters}': {command.Summary}");
						}
					}

					if (commandList.Length > 0)
					{
						embedBuilder.AddField(module.Name, commandList.ToString());
					}
				}
			}
			await ReplyAsync(embed: embedBuilder.Build());
		}
	}
}