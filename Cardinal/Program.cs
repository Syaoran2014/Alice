using Discord;
using Discord.WebSocket;
using Newtonsoft.Json;  
using System;
using System.IO;
using Cardinal.Configuration;
using Cardinal.Core;
using Cardinal.Data;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Discord.Commands;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Linq;
using Discord.Net;
using Cardinal.Commands;

namespace Cardinal
{
    internal class Program
    {
        static void Main(string[] args) => new Program().MainAsync().GetAwaiter().GetResult();

        public static DiscordSocketClient _client;
        private static CommandService _commands = new CommandService();
        public static XpService Xp = new XpService();
        public static BotConfig Config;
        private IServiceProvider _services;
        public static Dictionary<String, Iservice> BotServices;

        public async Task MainAsync()
        {
            //Add SocketConfig Here probably
            var _config = new DiscordSocketConfig
            {
                MessageCacheSize = 1000,
                AlwaysDownloadUsers = true,
                LogLevel = Discord.LogSeverity.Info,
                DefaultRetryMode = Discord.RetryMode.RetryRatelimit,
                GatewayIntents = GatewayIntents.Guilds |
                GatewayIntents.GuildMembers |
                GatewayIntents.GuildMessageReactions |
                GatewayIntents.GuildMessages |
                GatewayIntents.GuildVoiceStates
            };

            _client = new DiscordSocketClient(_config);

            _services = new ServiceCollection()
                .BuildServiceProvider();

            var CommandHandling = new CommandHandler(_client, _commands);
            var serverLogger = new ServerLogger(_client);

            _client.Log += Logger.Discord;

            Logger.Log("Loading Config");
            LoadConfig();

            await CommandHandling.initilizeAsync();
            await serverLogger.InitiliazeLogger();

            BotServices = new Dictionary<string, Iservice>
            {
                {"DatabaseCore", new DatabaseCore() }
            };
            for (int i = 0; i < BotServices.Count; i++)
            {
                BotServices.Values.ElementAt(i).Initialise();
            }

            Logger.Log("Logging in");
            await _client.LoginAsync(TokenType.Bot, Config.token);
            Logger.Log("Starting Bot");
            await _client.StartAsync();

            _client.Ready += Client_Ready;

            //_client.Ready += () =>
            //{
            //    Client_Ready;
            //    Logger.Log($"Successfully Logged in as {_client.CurrentUser}");
            //    return Task.CompletedTask;
            //};

            _client.SlashCommandExecuted += SlashCommandHandler;

            _client.MessageReceived += Xp.GenerateXp;

            await Task.Delay(-1);
        }

        public async Task Client_Ready()
        {
            var globalCommand = new SlashCommandBuilder();
            globalCommand.WithName("first-global-command");
            globalCommand.WithDescription("First Global Slash command");

            try
            {
                await _client.CreateGlobalApplicationCommandAsync(globalCommand.Build());
            }
            catch(HttpException exception)
            {
                var json = JsonConvert.SerializeObject(exception.Errors, Formatting.Indented);
                Console.WriteLine(json);
            }

            Logger.Log($"Successfully Logged in as {_client.CurrentUser}");
        }

        private async Task SlashCommandHandler(SocketSlashCommand command)
        {

            await command.RespondAsync($"You Executed {command.Data.Name}");
        }

        public static void LoadConfig()
        {
            using(StreamReader f = new StreamReader(@"Configuration/Config.json"))
            {
                string json = f.ReadToEnd();
                Config = JsonConvert.DeserializeObject<BotConfig>(json);
            }
        }

    }
}
