class ExpService {
  constructor(util) {
    this.util = util;

    const xpCooldown = new Map();

    this.util.bot.on(this.util.lib.Events.MessageCreate, async (message) => {
      if (message.author.bot || !message.guild) {
        return;
      }

      const userId = message.author.id;

      if (xpCooldown.has(userId)) {
        const lastXpTimestamp = xpCooldown.get(userId);
        const currentTime = Date.now();

        const timeDifference = currentTime - lastXpTimestamp;

        const cooldownDuration = 60000; // 1 Minute

        if (timeDifference < cooldownDuration) {
          return;
        }
      }

      this.util.dataHandler.getUserInfo(userId, (err, userInfo) => {
        if (err) {
          this.util.logger.error(err.message);
          return;
        }

        if (!userInfo) {
          //User doesn't exist, initialize
          const initialUserData = {
            UserId: userId,
            UserName: message.author.username,
            GuildId: message.guild.id,
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
            Currency: 0,
            Inventory: {},
            DailyStreak: null,
            LastDailyClaim: null
          };

          this.util.dataHandler
            .getDatabase()
            .run(
              "INSERT INTO DiscordUserData (UserId, UserName, GuildId, VIP_Tier, VIPLevel, VIP_Exp, LevelXp, Xp, ChatLvl, TotalXp, ChatExp, Birthday, LastXpGain, Currency, Inventory, DailyStreak, LastDailyClaim) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
              Object.values(initialUserData),
              (err) => {
                if (err) {
                  this.util.logger.error(err.message);
                  return;
                }
                this.util.logger.log(
                  `Initialized user data for ${message.author.tag}`
                );
              }
            );
        } else {
          const newXp = weightedRandomNumber();

          const updatedXp = parseInt(userInfo.ChatExp) + newXp;
          const currentLevel = userInfo.ChatLvl;
          const nextLvlExp = Math.floor(getLevelTotalXp(currentLevel));

          if (updatedXp >= nextLvlExp) {
            this.util.dataHandler
              .getDatabase()
              .run(
                "UPDATE DiscordUserData SET ChatExp = ?, ChatLvl = ?, LevelXp = ? WHERE UserId = ?",
                [
                  updatedXp,
                  currentLevel + 1,
                  Math.floor(getLevelTotalXp(currentLevel + 2)),
                  userId,
                ],
                (err) => {
                  if (err) {
                    this.util.logger.error(err.message);
                    return;
                  }
                  this.util.logger.log(
                    `${message.author.tag} leveled to ${
                      currentLevel + 1
                    }, and gained ${newXp} XP.`
                  );
                  xpCooldown.set(userId, Date.now());
                }
              );
          } else {
            this.util.dataHandler
              .getDatabase()
              .run(
                "UPDATE DiscordUserData SET ChatExp = ? WHERE UserId = ?;",
                [updatedXp, userId],
                (err) => {
                  if (err) {
                    this.util.logger.error(err.message);
                    return;
                  }
                  this.util.logger.log(
                    `${message.author.tag} gained ${newXp} XP.`
                  );

                  xpCooldown.set(userId, Date.now());
                }
              );
          }
        }
      });
    });
  }
};

module.exports = ExpService;

function weightedRandomNumber() {
  const minOutput = 2;
  const maxOutput = 25;
  const outputRange = maxOutput - minOutput + 1;

  const randomOffset = Math.floor(Math.random() * outputRange + minOutput);

  return randomOffset;
}

function getLevelTotalXp(cLevel) {
  const baseXp = 100;
  const growthFactor = 1.15;
  const nextLevel = cLevel;
  return (
    (baseXp * (Math.pow(growthFactor, nextLevel) - 1)) / (growthFactor - 1)
  );
}
