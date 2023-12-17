const { dailyCooldown } = require(`../commands/activity/daily`);

class scheduleHandler {
    constructor(util) {
        this.util = util; 
        this.scheduleMidnightTask();
    }

    scheduleMidnightTask() {
        const now = new Date(); 
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

        // let nextInterval = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 30, 0, 0);
        // const timeToNextInterval = nextInterval.getTime() - now.getTime();

        const timeToMidnight = midnight.getTime() - now.getTime();
        setTimeout(() => {
            this.performDailyReset();

            this.scheduleMidnightTask();
        }, timeToMidnight);
    }

    performDailyReset() {
        dailyCooldown.clear();
        console.log("Daily Map cleared.");
    }
}

module.exports = scheduleHandler;
