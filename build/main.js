"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_axios = __toESM(require("axios"));
var import_register = require("source-map-support/register");
var import_library = require("./lib/library");
var import_definition = require("./lib/definition");
class PirateWeather extends utils.Adapter {
  library;
  unload = false;
  getWeatherLoopTimeout = null;
  constructor(options = {}) {
    super({
      ...options,
      name: "pirate-weather"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this.library = new import_library.Library(this, "PirateWeather");
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    if (this.config.pollInterval < 1) {
      this.log.warn(`Invalid poll interval: ${this.config.pollInterval}. Using default value of 1 hour.`);
      this.config.pollInterval = 1;
    }
    if (!this.config.apiToken) {
      this.log.error("API token is not set in the adapter configuration. Please set it in the adapter settings.");
      return;
    }
    if (!this.config.position || typeof this.config.position !== "string" || !this.config.position.split(",").every((coord) => !isNaN(parseFloat(coord)))) {
      this.log.error("Position is not set in the adapter configuration. Please set it in the adapter settings.");
      return;
    }
    await this.library.init();
    const states = await this.getStatesAsync("*");
    await this.library.initStates(states);
    await this.getPirateWeatherLoop();
  }
  getPirateWeatherLoop = async () => {
    try {
      if (this.getWeatherLoopTimeout) {
        this.clearTimeout(this.getWeatherLoopTimeout);
      }
      await this.getData();
      await this.setState("info.connection", true, true);
    } catch (error) {
      this.log.error(`Error in getPirateWeatherLoop: ${JSON.stringify(error)}`);
      await this.setState("info.connection", false, true);
    } finally {
      const loopTime = (/* @__PURE__ */ new Date()).setHours((/* @__PURE__ */ new Date()).getHours() + this.config.pollInterval, 0, 0) + 100 + Math.floor(Math.random() * 3e3);
      this.getWeatherLoopTimeout = this.setTimeout(() => {
        void this.getPirateWeatherLoop();
      }, loopTime - Date.now());
    }
  };
  getData = async () => {
    try {
      const result = await import_axios.default.get(
        `https://api.pirateweather.net/forecast/${this.config.apiToken}/${this.config.position}?units=${this.config.units || "si"}&icon=pirate`
      );
      if (result.status === 200) {
        this.log.debug(`Data fetched successfully: ${JSON.stringify(result.data)}`);
        result.data.units = result.data.flags.units;
        result.data["nearest-station"] = result.data.flags["nearest-station"];
        result.data.version = result.data.flags.version;
        delete result.data.flags;
        if (!this.config.minutes) {
          delete result.data.minutely;
        }
        await this.library.writeFromJson("weather", "", import_definition.genericStateObjects, result.data, true);
      }
    } catch (error) {
      this.log.error(`Error fetching data from Pirate Weather API: ${JSON.stringify(error)}`);
    }
  };
  onUnload(callback) {
    try {
      void this.setState("info.connection", false, true);
      if (this.getWeatherLoopTimeout) {
        this.clearTimeout(this.getWeatherLoopTimeout);
      }
      callback();
    } catch {
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new PirateWeather(options);
} else {
  (() => new PirateWeather())();
}
//# sourceMappingURL=main.js.map
