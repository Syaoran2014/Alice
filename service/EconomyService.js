class EconomyService { 
    constructor(util){
        this.util = util;
        this.currnecyCooldown = new Map();
    }

    generateCurrency(user) {
        const userId = user.id;

        if (this.currnecyCooldown.has(userId)) { 
            const lastCurrencyGain = this.currnecyCooldown.get(userId);
            const currentTime = Date.now();
            const timeDifference = currentTime - lastCurrencyGain; 
            const cooldownDuration = 300000; // 5 Minutes

            if (timeDifference < cooldownDuration) {
                return; 
            }
        }
        
        this.util.dataHandler.getDatabase().run(
            "UPDATE DiscordUserData SET Currency = Currency + 100 WHERE UserId = ?;",
            [userId],
            (err) => {
                if (err) {
                    this.util.logger.error(err.message);
                    return;
                }
                this.currnecyCooldown.set(userId, Date.now());
            }
        );
    }
}

module.exports = EconomyService;
