using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cardinal.Data
{
    public partial class DiscordUserData
    {
        [Key]
        public ulong UserID { get; set; }
        public string UserName { get; set; }
        public ulong GuildId { get; set; }
        public int VIP_Tier { get; set; }
        public int VIPLevel { get; set; }
        public int VIP_Exp { get; set; }
        public double LevelXp { get; set; }
        public int Xp { get; set; }
        public int TotalXp { get; set; }
        public int ChatLvl { get; set; }
        public int ChatExp { get; set; }
        public DateTime Birthday { get; set; }
        public DateTime LastXpGain { get; set; } = DateTime.MinValue;

    }
}
