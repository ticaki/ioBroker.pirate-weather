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
var import_register = require("source-map-support/register");
var import_library = require("./lib/library");
var import_definition = require("./lib/definition");
class PirateWeather extends utils.Adapter {
  library;
  unload = false;
  online = null;
  getWeatherLoopTimeout = null;
  lang = "en";
  controller = null;
  timeoutId = void 0;
  constructor(options = {}) {
    super({
      ...options,
      name: "pirate-weather",
      useFormatDate: true
      // Use formatDate from utils
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this.library = new import_library.Library(this, "PirateWeather");
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    if (this.config.pollingInMinutes) {
      if (typeof this.config.pollIntervalMinutes !== "number" || this.config.pollIntervalMinutes < 1) {
        this.log.warn(
          `Invalid poll interval in minutes: ${this.config.pollIntervalMinutes}. Using safe value of 60 minutes.`
        );
        this.config.pollIntervalMinutes = 60;
      }
      this.config.pollIntervalMinutes = Math.ceil(this.config.pollIntervalMinutes);
    } else {
      if (typeof this.config.pollInterval !== "number" || this.config.pollInterval < 1) {
        this.log.warn(`Invalid poll interval: ${this.config.pollInterval}. Using default value of 1 hour.`);
        this.config.pollInterval = 1;
      }
      this.config.pollInterval = Math.ceil(this.config.pollInterval);
    }
    if (!this.config.apiToken) {
      this.log.error("API token is not set in the adapter configuration. Please set it in the adapter settings.");
      return;
    }
    if (!this.config.position || typeof this.config.position !== "string" || !this.config.position.split(",").every((coord) => !isNaN(parseFloat(coord)))) {
      this.log.error("Position is not set in the adapter configuration. Please set it in the adapter settings.");
      return;
    }
    if (this.config.hours < 0 || this.config.hours > 48) {
      this.log.warn(`Invalid hours to display: ${this.config.hours}. Using default value of 24 hours.`);
      this.config.hours = 24;
    }
    this.lang = this.language ? this.language.split("-")[0] : "en";
    (0, import_definition.setUnits)(this.config.units);
    await this.library.init();
    const states = await this.getStatesAsync("*");
    await this.library.initStates(states);
    await this.delay(1e3);
    await this.getPirateWeatherLoop();
    this.log.info(
      `Pirate Weather adapter started with position: ${this.config.position} and poll interval: ${this.config.pollingInMinutes ? `${this.config.pollIntervalMinutes} minute(s)` : `${this.config.pollInterval} hour(s)`}.`
    );
  }
  getPirateWeatherLoop = async () => {
    let errorState = false;
    try {
      if (this.getWeatherLoopTimeout) {
        this.clearTimeout(this.getWeatherLoopTimeout);
      }
      await this.getData();
      await this.setState("info.connection", true, true);
      if (this.online !== true) {
        this.log.debug("Pirate Weather is online");
      }
      this.online = true;
    } catch (error) {
      if (error.name !== "AbortError") {
        this.log.error(`Error in getPirateWeatherLoop: ${JSON.stringify(error)}`);
      }
      await this.setState("info.connection", false, true);
      if (this.online !== false) {
        this.log.warn("Pirate Weather is offline. Retrying in 10 minutes.");
      }
      this.online = false;
      errorState = true;
    } finally {
      if (!this.unload) {
        let loopTime = 6e5 + Date.now();
        if (this.config.pollingInMinutes) {
          loopTime = (/* @__PURE__ */ new Date()).setMinutes((/* @__PURE__ */ new Date()).getMinutes() + this.config.pollIntervalMinutes, 0);
          if (new Date(loopTime).getHours() != (/* @__PURE__ */ new Date()).getHours()) {
            loopTime = (/* @__PURE__ */ new Date()).setHours((/* @__PURE__ */ new Date()).getHours() + 1, 0, 0);
          }
        } else if (!errorState) {
          loopTime = (/* @__PURE__ */ new Date()).setHours((/* @__PURE__ */ new Date()).getHours() + this.config.pollInterval, 0, 0);
        }
        loopTime += 2e3 + Math.ceil(Math.random() * 3e3);
        this.log.debug(
          `Next update scheduled for: ${new Date(loopTime).toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" })}:${`00${Math.floor(loopTime / 1e3) % 60}`.slice(-2)}:${`000${loopTime % 1e3}`.slice(-3)}`
        );
        this.getWeatherLoopTimeout = this.setTimeout(() => {
          void this.getPirateWeatherLoop();
        }, loopTime - Date.now());
      }
    }
  };
  getData = async () => {
    const url = `https://api.pirateweather.net/forecast/${this.config.apiToken}/${this.config.position}?units=${this.config.units || "si"}&icon=pirate&version=2&lang=${this.lang}${!this.config.minutes ? "&exclude=minutely" : ""}`;
    const response = await this.fetch(url);
    if (this.unload) {
      return;
    }
    if (response.status === 200) {
      const data = await response.json();
      this.log.debug(`Data fetched successfully: ${JSON.stringify(data)}`);
      if (data.flags) {
        data.units = data.flags.units;
        data["nearest-station"] = data.flags["nearest-station"];
        data.version = data.flags.version;
        delete data.flags;
      }
      if (data.hourly && data.hourly.data) {
        if (this.config.hours > 0) {
          data.hourly.data = data.hourly.data.slice(0, this.config.hours);
        } else {
          data.hourly.data = [];
        }
      }
      for (const d of [data.hourly.data, data.daily.data, [data.currently]]) {
        if (d && d.length) {
          for (let a = 0; a < d.length; a++) {
            d[a].windBearingText = this.library.getTranslation(this.getWindBearingText(d[a].windBearing));
            d[a].cloudCover = Math.round(d[a].cloudCover * 100);
            d[a].precipProbability = Math.round(d[a].precipProbability * 100);
            d[a].humidity = Math.round(d[a].humidity * 100);
            if (this.config.units === "ca") {
              d[a].precipAccumulation = d[a].precipAccumulation ? Math.round(d[a].precipAccumulation * 10) : d[a].precipAccumulation;
              if (d !== data.hourly.data) {
                d[a].snowAccumulation = d[a].snowAccumulation ? Math.round(d[a].snowAccumulation * 10) : d[a].snowAccumulation;
                d[a].iceAccumulation = d[a].iceAccumulation ? Math.round(d[a].iceAccumulation * 10) : d[a].iceAccumulation;
                d[a].liquidAccumulation = d[a].liquidAccumulation ? Math.round(d[a].liquidAccumulation * 10) : d[a].liquidAccumulation;
              }
            }
            if (d === data.daily.data) {
              d[a].moonPhase = Math.round(d[a].moonPhase * 100);
              d[a].sunriseTime = d[a].sunriseTime * 1e3;
              d[a].sunsetTime = d[a].sunsetTime * 1e3;
              d[a].apparentTemperatureMinTime = d[a].apparentTemperatureMinTime * 1e3;
              d[a].apparentTemperatureMaxTime = d[a].apparentTemperatureMaxTime * 1e3;
              d[a].apparentTemperatureLowTime = d[a].apparentTemperatureLowTime * 1e3;
              d[a].apparentTemperatureHighTime = d[a].apparentTemperatureHighTime * 1e3;
              d[a].temperatureMinTime = d[a].temperatureMinTime * 1e3;
              d[a].temperatureMaxTime = d[a].temperatureMaxTime * 1e3;
              d[a].temperatureLowTime = d[a].temperatureLowTime * 1e3;
              d[a].temperatureHighTime = d[a].temperatureHighTime * 1e3;
              d[a].windGustTime = d[a].windGustTime * 1e3;
              d[a].precipIntensityMaxTime = d[a].precipIntensityMaxTime * 1e3;
              d[a].uvIndexTime = d[a].uvIndexTime * 1e3;
            }
            d[a].iconUrl = this.getIconUrl(d[a].icon);
            d[a].time = d[a].time * 1e3;
          }
        }
      }
      if (!this.config.minutes) {
        delete data.minutely;
      }
      data.lastUpdate = Date.now();
      await this.library.writeFromJson("weather", "weather", import_definition.genericStateObjects, data, true);
    } else {
      throw new Error({ status: response.status, statusText: response.statusText });
    }
  };
  getIconUrl(icon) {
    icon = icon.replace("mostly-", "").replace("light-", "").replace("heavy-", "").replace("precipitation", "rain");
    return `/adapter/${this.name}/icons/icebear/${icon}.svg`;
  }
  onUnload(callback) {
    try {
      this.unload = true;
      void this.setState("info.connection", false, true);
      if (this.getWeatherLoopTimeout) {
        this.clearTimeout(this.getWeatherLoopTimeout);
      }
      if (this.controller) {
        this.controller.abort();
        this.controller = null;
      }
      if (this.timeoutId) {
        this.clearTimeout(this.timeoutId);
        this.timeoutId = void 0;
      }
      callback();
    } catch {
      callback();
    }
  }
  getWindBearingText(windBearing) {
    if (windBearing === void 0) {
      return "";
    }
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW"
    ];
    const index = Math.round(windBearing % 360 / 22.5) % 16;
    return directions[index];
  }
  async fetch(url, init) {
    var _a;
    this.controller = new AbortController();
    this.timeoutId = this.setTimeout(() => {
      this.controller && this.controller.abort();
      this.controller = null;
    }, 3e4);
    try {
      const response = await fetch(url, {
        ...init,
        method: (_a = init == null ? void 0 : init.method) != null ? _a : "GET",
        signal: this.controller.signal
      });
      this.clearTimeout(this.timeoutId);
      this.timeoutId = void 0;
      this.controller = null;
      return response;
    } catch (error) {
      this.clearTimeout(this.timeoutId);
      this.timeoutId = void 0;
      this.controller = null;
      throw error;
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new PirateWeather(options);
} else {
  (() => new PirateWeather())();
}
//# sourceMappingURL=main.js.map
