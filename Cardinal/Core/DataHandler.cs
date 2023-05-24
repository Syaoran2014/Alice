using Cardinal.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cardinal.Core
{
    public class DataHandler
    {
        public static async void SetBirthday(ulong UserID, DateTime birthday)
        {
            using (var Db = new DatabaseCore())
            {
                DiscordUserData current = Db.DiscordUserData.Where(x => x.UserID == UserID).FirstOrDefault();
                current.Birthday = birthday;
                Console.WriteLine(birthday);
                Db.DiscordUserData.Update(current);

                await Db.SaveChangesAsync();
            }
        }
        public static DateTime getBirthday(ulong UserID)
        {
            using (var Db = new DatabaseCore())
            {
                return Db.DiscordUserData.Where(x => x.UserID == UserID).Select(x => x.Birthday).FirstOrDefault();
            }
        }
        public static async void setVIPExp(ulong UserID, int exp)
        {
            using (var Db = new DatabaseCore())
            {
                DiscordUserData current = Db.DiscordUserData.Where(x => x.UserID == UserID).FirstOrDefault();
                current.VIP_Exp = exp;
                Db.DiscordUserData.Update(current);

                await Db.SaveChangesAsync();
            }
        }
        public static async void addVIPExp(ulong UserID, int exp)
        {
            using (var Db = new DatabaseCore())
            {
                DiscordUserData current = Db.DiscordUserData.Where(x => x.UserID == UserID).FirstOrDefault();
                current.VIP_Exp += exp;
                Db.DiscordUserData.Update(current);

                await Db.SaveChangesAsync();
            }
        }
        public static int getVipExp(ulong UserID)
        {
            using (var Db = new DatabaseCore())
            {
                return Db.DiscordUserData.Where(x => x.UserID == UserID).Select(x => x.VIP_Exp).FirstOrDefault();
            }
        }
    }
}
