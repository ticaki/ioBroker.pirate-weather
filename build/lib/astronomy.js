"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var astronomy_exports = {};
__export(astronomy_exports, {
  calculateAstronomyData: () => calculateAstronomyData
});
module.exports = __toCommonJS(astronomy_exports);
var SunCalc = __toESM(require("suncalc"));
function calculateAstronomyData(date, latitude, longitude) {
  const sunTimes = SunCalc.getTimes(date, latitude, longitude);
  const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);
  const dayLength = sunTimes.sunset.getTime() - sunTimes.sunrise.getTime();
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextSunTimes = SunCalc.getTimes(nextDay, latitude, longitude);
  const nightLength = nextSunTimes.sunrise.getTime() - sunTimes.sunset.getTime();
  let moonVisibleDuration = null;
  if (moonTimes.rise && moonTimes.set) {
    if (moonTimes.set.getTime() > moonTimes.rise.getTime()) {
      moonVisibleDuration = moonTimes.set.getTime() - moonTimes.rise.getTime();
    } else {
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      moonVisibleDuration = endOfDay.getTime() - moonTimes.rise.getTime() + (moonTimes.set.getTime() - startOfDay.getTime());
    }
  }
  const lunarTransit = calculateLunarTransit(date, latitude, longitude);
  return {
    civilDawn: sunTimes.dawn.getTime(),
    civilDusk: sunTimes.dusk.getTime(),
    nauticalDawn: sunTimes.nauticalDawn.getTime(),
    nauticalDusk: sunTimes.nauticalDusk.getTime(),
    astronomicalDawn: sunTimes.nightEnd.getTime(),
    astronomicalDusk: sunTimes.night.getTime(),
    dayLength,
    nightLength,
    solarNoon: sunTimes.solarNoon.getTime(),
    moonrise: moonTimes.rise ? moonTimes.rise.getTime() : null,
    moonset: moonTimes.set ? moonTimes.set.getTime() : null,
    moonVisibleDuration,
    lunarTransit
  };
}
function calculateLunarTransit(date, latitude, longitude) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  const tolerance = 1e3;
  let a = dayStart.getTime();
  let b = dayEnd.getTime();
  const getAltitude = (timestamp) => {
    const position = SunCalc.getMoonPosition(new Date(timestamp), latitude, longitude);
    return -position.altitude;
  };
  const phi = (1 + Math.sqrt(5)) / 2;
  const resphi = 2 - phi;
  let x = a + resphi * (b - a);
  let fx = getAltitude(x);
  while (Math.abs(b - a) > tolerance) {
    const c = b - resphi * (b - a);
    const fc = getAltitude(c);
    if (fc < fx) {
      b = x;
      x = c;
      fx = fc;
    } else {
      a = c;
    }
  }
  return Math.round(x);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calculateAstronomyData
});
//# sourceMappingURL=astronomy.js.map
