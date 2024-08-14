const { dailyCooldown } = require(`../commands/activity/daily`);
//const { hourlyCooldown } = require('../commands/activity/work');
const { hourlyCooldown } = require(`../commands/activity/work`);

class scheduleHandler {
    constructor(util) {
        this.util = util; 
        this.scheduleMidnightTask();
        this.scheduleHourlyTask(); 
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

    scheduleHourlyTask() {
        const now = new Date();
        const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0); 

        const timeToNextHour = nextHour.getTime() - now.getTime();
        setTimeout(() => {
            this.performHourlyReset();
            this.scheduleHourlyTask();
        }, timeToNextHour);
    }

    performHourlyReset() {
        hourlyCooldown.clear();
        console.log('Work Map cleared.');
    }

}

module.exports = scheduleHandler;
