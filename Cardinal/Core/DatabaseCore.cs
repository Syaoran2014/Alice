using Microsoft.EntityFrameworkCore;
using Cardinal.Core;
using Cardinal.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cardinal.Core
{
    public class DatabaseCore : DbContext, Iservice
    {
        public DbSet<DiscordUserData> DiscordUserData { get; set; }
        public void Initialise()
        {
            Logger.Log("Initialising Database...");
            var context = new DatabaseCore();
            context.Database.Migrate();
            Logger.Log("Database updated and ready to go!");
        }

        protected override void OnConfiguring(DbContextOptionsBuilder Options)
        {
            Options.UseSqlite(@"Data Source=Data/Cardinal.db");
        }

    }
}
