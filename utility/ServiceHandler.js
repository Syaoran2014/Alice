class ServiceHandler {
  constructor(util) {
    this.util = util;
    this.services = {};

    this.util.logger.log("Initializing services...");

    this.util.fs.readdirSync(__dirname + "/../service/").forEach((service) => {
      let service_name = service.split(".js")[0];
      let Service = require(__dirname + "/../service/" + service);
      this.services[service_name] = new Service(this.util);
      if (typeof this.services[service_name].initialize === 'function') {
        this.services[service_name].initialize();
      }
      this.util.logger.log("   - " + service_name + " initialized.");
    });
  }

  get(name) {
    return this.services[name];
  }
}

module.exports = ServiceHandler;
