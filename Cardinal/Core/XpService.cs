using Discord.WebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cardinal.Data;
using System.Text.RegularExpressions;

namespace Cardinal.Core
{
    public class XpService
    {
        public double points = 25;
        public int gainedXp;
        public string formattedMsg, removedSpace;
        public async Task GenerateXp(SocketMessage msg)
        {
            var chnl = msg.Channel as SocketGuildChannel;
            var guild = chnl.Guild.Id;

            using (var Db = new DatabaseCore())
            {
                if (msg.Author.IsBot) return;
                if (Db.DiscordUserData.Where(x => x.UserID == msg.Author.Id).Count() < 1)
                {
                    Db.DiscordUserData.Add(new DiscordUserData
                    {
                        UserID = msg.Author.Id,
                        UserName = msg.Author.Username,
                        GuildId = guild,
                        ChatExp = 25,
                        LevelXp = 625,
                        ChatLvl = 0,
                        LastXpGain = DateTime.Now,
                    });
                }
                else
                {
                    DiscordUserData current = Db.DiscordUserData.Where(x => x.UserID == msg.Author.Id).FirstOrDefault();
                    if ((DateTime.Now - current.LastXpGain).TotalSeconds <= 60) return;
                    else
                    {
                        formattedMsg = Regex.Replace(msg.Content, "<.*?>", "12345");
                        removedSpace = Regex.Replace(formattedMsg, @"\s+", "");
                        gainedXp = (removedSpace.Length / 2);
                        current.ChatExp += gainedXp;
                        current.LastXpGain = DateTime.Now;
                        Db.DiscordUserData.Update(current);

                        if (current.ChatExp >= current.LevelXp)
                        {
                            current.ChatLvl++;
                            current.LevelXp = Math.Pow(((current.ChatLvl + 1) * 25), 2);
                            Db.DiscordUserData.Update(current);
                        }
                    }
                }

                await Db.SaveChangesAsync();
            }

        }
        public static int GetXp(ulong UserID)
        {
            using (var Db = new DatabaseCore())
            {
                return Db.DiscordUserData.Where(x => x.UserID == UserID).Select(x => x.ChatExp).FirstOrDefault();
            }
        }
        public static int GetLevelXp(ulong UserID)
        {
            using (var Db = new DatabaseCore())
            {
                return (int)Db.DiscordUserData.Where(x => x.UserID == UserID).Select(x => x.LevelXp).FirstOrDefault();
            }
        }
        public static int GetLevel(ulong UserID)
        {
            using (var Db = new DatabaseCore())
            {
                return (int)Db.DiscordUserData.Where(x => x.UserID == UserID).Select(x => x.ChatLvl).FirstOrDefault();
            }
        }
    }
}
