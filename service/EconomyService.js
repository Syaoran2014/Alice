class EconomyService { 
    constructor(util){
        this.util = util;
        this.currnecyCooldown = new Map();

        /*this.util.bot.on(this.util.lib.Events.MessageCreate, async (message) => {
            if (message.author.bot || !message.guild) {
                return;
            }

            const userId = message.author.id;

            if (currnecyCooldown.has(userId)){
                const lastCurrencyGain = currnecyCooldown.get(userId);
                const currentTime = Date.now();
                const timeDifference = currentTime - lastCurrencyGain;
                const cooldownDuration = 300000;

                if ( timeDifference < cooldownDuration) {
                    return;
                }
            }

            this.util.dataHandler.getUserInfo(userId, (err, userInfo) => {
                if (err) {
                    this.util.logger.error(err.message);
                    return;
                }
                if(!userInfo) {
                    //User doesn't exist, let expService Handle Initialization
                    return;
                } else {
                    if (!userInfo.Currency){
                        var updatedCurrency = 10; 
                    } else {
                        var updatedCurrency = parseInt(userInfo.Currency) + 10; 
                    }
                    this.util.dataHandler.getDatabase().run(
                        "UPDATE DiscordUserData SET Currency = ? WHERE UserId = ?;",
                        [updatedCurrency, userId],
                        (err) => {
                            if (err){
                                this.util.logger.error(err.message);
                                return;
                            }
                            currnecyCooldown.set(userId, Date.now());
                        }
                    );
                }
            });
        });
        */
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
