const sqlite = require("sqlite3").verbose();

class DataHandler {
  constructor(util) {
    this.util = util;
    if (!util.fs.existsSync(__dirname + "/../data/Cardinal.db")) {
      let timeout = 5000;
      util.logger.log(
        `Setting timeout to create server configs to ${(timeout / 1000).toFixed(
          2
        )} seconds.`
      );
      setTimeout(() => {
        util.bot.guilds.cache.forEach((guild) => {
          let log_channel = null;
          let log_enabled = 0;
          let muted_role = null;

          guild.channels.cache.forEach((channel) => {
            if (
              (channel.type == 0 && channel.name.toLowerCase() == "📜│logs") ||
              (channel.type == 0 && channel.name.toLowerCase() == "logs")
            ) {
              log_channel = channel.id;
              log_enabled = 1;
            }
          });
          guild.roles.cache.forEach((role) => {
            if (
              !role.permissions.has("Administrator", { checkAdmin: true }) &&
              role.name == "Muted"
            ) {
              muted_role = role.id;
            }
          });

          util.dataHandler
            .getDatabase()
            .run(
              "INSERT INTO ServerConfig (GuildId, LogEnabled, LogChannel, MutedRole, DjRole, DisabledCmds, AutoRoleEnabled, AutoRole) VALUES(?, ?, ?, ?, ?, ?, ?, ?);",
              [guild.id, log_enabled, log_channel, muted_role, null, "[]", null, null],
              (err) => {
                util.logger.log(
                  `Set guild data for: ${guild.name} (${guild.id}) members: ${guild.memberCount}`
                );
                if (err) {
                  util.logger.error(err.message);
                  return;
                }
                util.logger.log("    - Initialized ServerInfo.");
                if (!muted_role)
                  util.logger.log("    - No muted role could be found!");
                if (!log_channel)
                  util.logger.log("    - No log channel could be found!");
              }
            );
        });
      }, timeout);
    }

    this.db = new sqlite.Database(__dirname + "/../data/Cardinal.db");
    this.db
      .run(
        "CREATE TABLE IF NOT EXISTS ServerConfig (Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, GuildId VARCHAR(18) NOT NULL, LogEnabled BOOLEAN, LogChannel VARCHAR(18), MutedRole VARCHAR(18),  DjRole VARCHAR(18), DisabledCmds MEDIUMBLOB NOT NULL, AutoRoleEnabled BOOLEAN, AutoRole VARCHAR(18));"
      )
      .on("error", (err) => {
        util.logger.error(
          "Error occured while trying to create ServerConfig table, " +
            err.message
        );
      });
    this.db
      .run(
        "CREATE TABLE IF NOT EXISTS DiscordUserData (UserID	INTEGER NOT NULL UNIQUE, UserName TEXT NOT NULL, GuildId INTEGER, VIP_Tier INTEGER, VIPLevel INTEGER, VIP_Exp INTEGER, LevelXp INTEGER, Xp INTEGER, ChatLvl INTEGER, TotalXp INTEGER, ChatExp BLOB, Birthday TEXT, LastXpGain TEXT, Currency INTEGER, Inventory BLOB, DailyStreak INTEGER, LastDailyClaim TEXT, PRIMARY KEY(UserID));"
      )
      .on("error", (err) => {
        util.logger.error(
          "Error occured while trying to create DiscordUserData table, " +
            err.message
        );
      });

      this.checkAndUpdateServerSchema();
      this.checkAndUpdateUserSchema();
  }

  checkAndUpdateServerSchema() {
    const desiredSchema = [
      "GuildId VARCHAR(18) NOT NULL", 
      "LogEnabled BOOLEAN",
      "LogChannel VARCHAR(18)",
      "MutedRole VARCHAR(18)",
      "DjRole VARCHAR(18)",
      "DisabledCmds MEDIUMBLOB NOT NULL",
      "AutoRoleEnabled BOOLEAN", 
      "AutoRole VARCHAR(18)",
    ];
    this.db.all("PRAGMA table_info(ServerConfig);", (err, rows) => {
      if (err) {
        this.util.logger.error(
          "Error occurred while checking table schema: " + err.message
        );
        return;
      }

      const existingColumns = rows.map((row) => row.name);
      const missingColumns = desiredSchema
        .filter((column) => !existingColumns.includes(column.split(" ")[0]));

      if (missingColumns.length > 0) {
        missingColumns.forEach((column) => {
          const updateSQL = `ALTER TABLE DiscordUserData ADD COLUMN ${column};`;
          this.db.run(updateSQL, (updateErr) => {
            if (updateErr) {
              this.util.logger.error("Error occurred while updating table schema: " + updateErr.message);
            } else {
              this.util.logger.log("Updated table schema.");
            }
          });
        });
      }
    });
  }

  checkAndUpdateUserSchema() {
    const userSchema = [
      "UserID INTEGER NOT NULL UNIQUE",
      "UserName TEXT NOT NULL",
      "GuildId INTEGER",
      "VIP_Tier INTEGER",
      "VIPLevel INTEGER",
      "VIP_Exp INTEGER",
      "LevelXp INTEGER",
      "Xp INTEGER",
      "ChatLvl INTEGER",
      "TotalXp INTEGER",
      "ChatExp BLOB",
      "Birthday TEXT",
      "LastXpGain TEXT",
      "Currency INTEGER",
      "Inventory BLOB",
      "DailyStreak INTEGER",
      "LastDailyClaim TEXT"
    ];
    this.db.all("PRAGMA table_info(DiscordUserData);", (err, rows) => {
      if (err){
        this.util.logger.error("Error occurred while checking table schema: " + err.message);
        return;
      }
      const existingColumns = rows.map((row) => row.name);
      const missingColumns = userSchema.filter((column) => !existingColumns.includes(column.split(" ")[0]));
      if (missingColumns.length > 0) {
        
        missingColumns.forEach((column) => {
          const updateSQL = `ALTER TABLE DiscordUserData ADD COLUMN ${column};`;
          this.db.run(updateSQL, (updateErr) => {
            if (updateErr) {
              this.util.logger.error("Error occurred while updating table schema: " + updateErr.message);
            } else {
              this.util.logger.log("Updated table schema.");
            }
          });
        });
        //const updateSQL = `ALTER TABLE DiscordUserData ADD COLUMN ${missingColumns.join(", ")};`;
        // this.db.run(updateSQL, (updateErr) => {
        //   if (updateErr) {
        //     this.util.logger.error("Error occurred while updating table schema: " + updateErr.message);
        //   } else {
        //     this.util.logger.log("Updated table schema.");
        //   }
        // });
      }
    });
  }

  getGuildConfig(guild_id, callback) {
    this.getDatabase().all(
      "SELECT * FROM ServerConfig WHERE GuildId = ?;",
      [guild_id],
      (err, rows) => {
        if (err) {
          this.util.logger.error(err.message);
          callback(err, null);
        }
        let res;
        rows.forEach((row) => {
          res = {
            LogEnabled: row.LogEnabled,
            LogChannel: row.LogChannel,
            MutedRole: row.MutedRole,
            DjRole: row.DjRole,
            DisabledCmds: JSON.parse(row.DisabledCmds),
            AutoRoleEnabled: row.AutoRoleEnabled,
            AutoRole: row.AutoRole
          };
        });
        callback(err, res);
      }
    );
  }

  getUserInfo(user_id, callback) {
    this.getDatabase().get(
      "SELECT * FROM DiscordUserData WHERE UserId = ?;",
      [user_id],
      (err, row) => {
        if (err) {
          this.util.logger.error(err.message);
          callback(err, null);
        }
        if (!row) {
          // User data doesn't exist in the database
          callback(null, null); // Pass null for both err and res
          return; // Exit the function
        }
        let res = {
          UserID: row.UserID,
          UserName: row.UserName,
          GuildId: row.GuildId,
          VIP_Tier: row.VIP_Tier,
          VIPLevel: row.VIPLevel,
          VIP_Exp: row.VIP_Exp,
          LevelXp: row.LevelXp,
          Xp: row.Xp,
          ChatLvl: row.ChatLvl,
          TotalXp: row.TotalXp,
          ChatExp: row.ChatExp,
          Birthday: row.Birthday,
          LastXpGain: row.LastXpGain,
          Currency: row.Currency,
          Inventory: row.Inventory,
          DailyStreak: row.DailyStreak,
          LastDailyClaim: row.LastDailyClaim
        };
        callback(err, res);
      }
    );
  }

  initializeUserInfo(user, guildId) {
    const initialUserData = {
      UserId: user.id,
      UserName: user.username,
      GuildId: guildId,
      VIP_Tier: 0,
      VIPLevel: 0,
      VIP_Exp: 0,
      LevelXp: 100,
      Xp: 0,
      ChatLvl: 1,
      TotalXp: 0,
      ChatExp: 10,
      Birthday: null,
      LastXpGain: null,
      Currency: 100,
      Inventory: JSON.stringify(`{}`),
      DailyStreak: null,
      LastDailyClaim: null
    };

    this.util.dataHandler.getDatabase().run(
      "INSERT INTO DiscordUserData (UserId, UserName, GuildId, VIP_Tier, VIPLevel, VIP_Exp, LevelXp, Xp, ChatLvl, TotalXp, ChatExp, Birthday, LastXpGain, Currency, Inventory, DailyStreak, LastDailyClaim) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
      Object.values(initialUserData),
      (err) => {
        if (err) {
          this.util.logger.error(err.message);
          return;
        }
        this.util.logger.log(
          `Initialized user data for ${user.username}`
        );
      }
    );
  }

  payout(userId, payout) {
    this.getDatabase().run(
      "UPDATE DiscordUserData Set Currency = Currency + ? WHERE UserId = ?",
      [payout, userId],
      (err) => {
        if (err) {
          this.util.logger.error(err.message);
          return;
        }
      }
    );
  }

  populateDisabledCmds(guild) {
    this.getDatabase().run(
      "UPDATE ServerConfig SET DisabledCmds = ? WHERE GuildId = ?",
      ["[]", guild.id],
      (err) => {
        if (err) {
          this.util.logger.error(err.message);
          return;
        }
        this.util.logger.log(
          `Populated DisabledCmds database entry for ${guild.name} (${guild.id})`
        );
      }
    );
  }

  getTopUsers(limit, callback){
    this.getDatabase().all(
      "SELECT * FROM DiscordUserData ORDER BY ChatExp DESC LIMIT ?;",
      [limit],
      (err, rows) => {
        if (err) {
          this.util.logger.error(err.message);
          callback(err, null);
        }
        callback(err, rows);
      }
    );
  }

  getTopCurrencyUsers(limit, callback){
    this.getDatabase().all(
      "SELECT * FROM DiscordUserData ORDER BY Currency DESC LIMIT ?;",
      [limit],
      (err, rows) => {
        if (err) {
          this.util.logger.error(err.message);
          callback(err, null);
        }
        callback(err, rows);
      }
    )
  }

  executeSQL(sql) {
    this.db.run(sql);
  }

  getDatabase() {
    return this.db;
  }
}

module.exports = DataHandler;
