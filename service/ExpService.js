class ExpService {
  constructor(util) {
    this.util = util;
    this.xpCooldown = new Map();
  }

  generateExp(user) {
    const userId = user.id; 

    if (this.xpCooldown.has(userId)) {
      const lastXpTimestamp = this.xpCooldown.get(userId);
      const currentTime = Date.now();
      const timeDifference = currentTime - lastXpTimestamp;

      const cooldownDuration = 60000; //1 Minute

      if (timeDifference < cooldownDuration) {
        return; 
      }
    }
    this.util.dataHandler.getUserInfo(userId, (err, userInfo) => {
      if (err) { 
        this.util.logger.error(err.message);
        return;
      }

      // Should always have userInfo if it makes it here...
      if (!userInfo) {
        this.util.logger.error(`User Info not initialized.`);
        return; 
      }

      const newXp = weightedRandomNumber();
      const updatedXp = parseInt(userInfo.ChatExp) + newXp;
      const currentLevel = userInfo.ChatLvl;
      const nextLvlExp = Math.floor(getLevelTotalXp(currentLevel));
      let levelUp = false; 

      if (updatedXp >= nextLvlExp) {
        levelUp = true;
      }

      this.xpCooldown.set(userId, Date.now());
      if (levelUp) {
        this.util.dataHandler.getDatabase().run(
          "UPDATE DiscordUserData SET ChatExp = ChatExp + ?, ChatLvl = ChatLvl + 1, LevelXp = ? WHERE UserId = ?",
          [newXp, Math.floor(getLevelTotalXp(currentLevel + 2)), userId], 
          (err) => {
            if (err) {
              this.util.logger.error(err.message);
              return; 
            } 
            //this.util.logger.log(`${user.username} leveled to ${currentLevel + 1}, and gained ${newXp} Xp.`);
          });
      } else {
        this.util.dataHandler.getDatabase().run(
          "UPDATE DiscordUserData SET ChatExp = ChatExp + ? WHERE UserId = ?",
          [newXp, userId], 
          (err) => {
            if (err) {
              this.util.logger.error(err.message);
              return; 
            } 
            //this.util.logger.log(`${user.username} gained ${newXp} Xp.`);
          }
        );
      }
    });  
  }
}

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
