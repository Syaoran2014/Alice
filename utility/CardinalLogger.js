class Logger {
  constructor(util) {
    this.util = util;
  }

  log(message) {
    this.logMessage("INFO", message);
  }

  warn(message) {
    this.logMessage("WARN", message);
  }

  error(message) {
    this.logMessage("ERROR", message);
  }

  logMessage(logLevel, message) {
    let log = `${
      new Date().toTimeString().split(" ")[0]
    }> [${logLevel}]: ${message}`;
    console.log(log);
  }
}

module.exports = Logger;
