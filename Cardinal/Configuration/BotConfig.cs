using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cardinal.Configuration
{
    public class BotConfig
    {
        public string token { get; set; }  

        public string prefix { get; set; }

        public ulong logChannel { get; set; }
    }
}
