/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import 'source-map-support/register';
import { Library } from './lib/library';
import { genericStateObjects, setUnits, type PirateWeatherTestdata } from './lib/definition';
type WeatherIcon =
    | 'clear-day'
    | 'clear-night'
    | 'rain'
    | 'snow'
    | 'sleet'
    | 'wind'
    | 'fog'
    | 'cloudy'
    | 'partly-cloudy-day'
    | 'partly-cloudy-night'
    | 'thunderstorm'
    | 'hail'
    | 'mixed'
    | 'none'
    | 'Not Available'
    | 'mostly-clear-day'
    | 'mostly-clear-night'
    | 'mostly-cloudy-day'
    | 'mostly-cloudy-night'
    | 'possible-rain-day'
    | 'possible-rain-night'
    | 'possible-snow-day'
    | 'possible-snow-night'
    | 'possible-sleet-day'
    | 'possible-sleet-night'
    | 'possible-precipitation-day'
    | 'possible-precipitation-night'
    | 'precipitation'
    | 'drizzle'
    | 'light-rain'
    | 'heavy-rain'
    | 'flurries'
    | 'light-snow'
    | 'heavy-snow'
    | 'very-light-sleet'
    | 'light-sleet'
    | 'heavy-sleet'
    | 'breezy'
    | 'dangerous-wind'
    | 'mist'
    | 'haze'
    | 'smoke';
class PirateWeather extends utils.Adapter {
    library: Library;
    unload: boolean = false;
    online: boolean | null = null;
    getWeatherLoopTimeout: ioBroker.Timeout | undefined | null = null;
    lang: string = 'en';

    controller: AbortController | null = null;
    timeoutId: ioBroker.Timeout | undefined = undefined;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'pirate-weather',
            useFormatDate: true, // Use formatDate from utils
        });
        this.on('ready', this.onReady.bind(this));
        // this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.library = new Library(this, 'PirateWeather');
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        if (this.config.pollingInMinutes) {
            if (typeof this.config.pollIntervalMinutes !== 'number' || this.config.pollIntervalMinutes < 1) {
                this.log.warn(
                    `Invalid poll interval in minutes: ${this.config.pollIntervalMinutes}. Using safe value of 60 minutes.`,
                );
                this.config.pollIntervalMinutes = 60; // Default to
            }
            this.config.pollIntervalMinutes = Math.ceil(this.config.pollIntervalMinutes);
        } else {
            if (typeof this.config.pollInterval !== 'number' || this.config.pollInterval < 1) {
                this.log.warn(`Invalid poll interval: ${this.config.pollInterval}. Using default value of 1 hour.`);
                this.config.pollInterval = 1; // Default to 1 minute if invalid
            }
            this.config.pollInterval = Math.ceil(this.config.pollInterval);
        }
        if (!this.config.apiToken) {
            this.log.error('API token is not set in the adapter configuration. Please set it in the adapter settings.');
            return;
        }
        if (
            !this.config.position ||
            typeof this.config.position !== 'string' ||
            !this.config.position.split(',').every(coord => !isNaN(parseFloat(coord)))
        ) {
            this.log.error('Position is not set in the adapter configuration. Please set it in the adapter settings.');
            return;
        }
        if (this.config.hours < 0 || this.config.hours > 48) {
            this.log.warn(`Invalid hours to display: ${this.config.hours}. Using default value of 24 hours.`);
            this.config.hours = 24; // Default to 24 hours if invalid
        }
        this.lang = this.language ? this.language.split('-')[0] : 'en';
        setUnits(this.config.units);
        await this.library.init();
        const states = await this.getStatesAsync('*');
        await this.library.initStates(states);
        await this.delay(1000); // Wait for 1 second to ensure the library is fully initialized
        await this.getPirateWeatherLoop();
        this.log.info(
            `Pirate Weather adapter started with position: ${this.config.position} and poll interval: ${this.config.pollingInMinutes ? `${this.config.pollIntervalMinutes} minute(s)` : `${this.config.pollInterval} hour(s)`}.`,
        );
    }

    getPirateWeatherLoop = async (): Promise<void> => {
        let errorState = false;
        try {
            if (this.getWeatherLoopTimeout) {
                this.clearTimeout(this.getWeatherLoopTimeout);
            }
            await this.getData();
            await this.setState('info.connection', true, true);
            if (this.online !== true) {
                this.log.debug('Pirate Weather is online');
            }
            this.online = true;
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                this.log.error(`Error in getPirateWeatherLoop: ${JSON.stringify(error)}`);
            }
            await this.setState('info.connection', false, true);
            if (this.online !== false) {
                this.log.warn('Pirate Weather is offline. Retrying in 10 minutes.');
            }
            this.online = false;
            errorState = true; // Set error to true to trigger the retry logic
        } finally {
            if (!this.unload) {
                let loopTime = 600000 + Date.now();
                if (this.config.pollingInMinutes) {
                    loopTime = new Date().setMinutes(new Date().getMinutes() + this.config.pollIntervalMinutes, 0);
                    if (new Date(loopTime).getHours() != new Date().getHours()) {
                        loopTime = new Date().setHours(new Date().getHours() + 1, 0, 0);
                    }
                } else if (!errorState) {
                    loopTime = new Date().setHours(new Date().getHours() + this.config.pollInterval, 0, 0);
                }
                loopTime += 2000 + Math.ceil(Math.random() * 3000); // Add a random delay of up to 3 second + 1,5 seconds
                this.log.debug(
                    `Next update scheduled for: ${new Date(loopTime).toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })}:${`00${Math.floor(loopTime / 1000) % 60}`.slice(-2)}:${`000${loopTime % 1000}`.slice(-3)}`,
                );
                // Schedule the next update

                this.getWeatherLoopTimeout = this.setTimeout(() => {
                    void this.getPirateWeatherLoop();
                }, loopTime - Date.now());
            }
        }
    };

    getData = async (): Promise<void> => {
        const url = `https://api.pirateweather.net/forecast/${this.config.apiToken}/${this.config.position}?units=${this.config.units || 'si'}&icon=pirate&version=2&lang=${this.lang}${
            !this.config.minutes ? '&exclude=minutely' : ''
        }`;

        const response = await this.fetch(url);

        if (this.unload) {
            return;
        }

        if (response.status === 200) {
            const data = (await response.json()) as PirateWeatherTestdata;
            this.log.debug(`Data fetched successfully: ${JSON.stringify(data)}`);
            if (data.flags) {
                data.units = data.flags.units;
                data['nearest-station'] = data.flags['nearest-station'];
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
                        if (this.config.units === 'ca') {
                            d[a].precipAccumulation = d[a].precipAccumulation
                                ? Math.round(d[a].precipAccumulation * 10)
                                : d[a].precipAccumulation;
                            if (d !== data.hourly.data) {
                                d[a].snowAccumulation = d[a].snowAccumulation
                                    ? Math.round(d[a].snowAccumulation * 10)
                                    : d[a].snowAccumulation;
                                d[a].iceAccumulation = d[a].iceAccumulation
                                    ? Math.round(d[a].iceAccumulation * 10)
                                    : d[a].iceAccumulation;
                                d[a].liquidAccumulation = d[a].liquidAccumulation
                                    ? Math.round(d[a].liquidAccumulation * 10)
                                    : d[a].liquidAccumulation;
                            }
                        }
                        if (d === data.daily.data) {
                            d[a].moonPhase = Math.round(d[a].moonPhase * 100);
                            d[a].sunriseTime = d[a].sunriseTime * 1000; // Convert to milliseconds
                            d[a].sunsetTime = d[a].sunsetTime * 1000; // Convert to milliseconds
                            d[a].apparentTemperatureMinTime = d[a].apparentTemperatureMinTime * 1000; // Convert to milliseconds
                            d[a].apparentTemperatureMaxTime = d[a].apparentTemperatureMaxTime * 1000; // Convert to milliseconds
                            d[a].apparentTemperatureLowTime = d[a].apparentTemperatureLowTime * 1000;
                            d[a].apparentTemperatureHighTime = d[a].apparentTemperatureHighTime * 1000; // Convert to milliseconds
                            d[a].temperatureMinTime = d[a].temperatureMinTime * 1000; // Convert to milliseconds
                            d[a].temperatureMaxTime = d[a].temperatureMaxTime * 1000; // Convert to milliseconds
                            d[a].temperatureLowTime = d[a].temperatureLowTime * 1000; // Convert to milliseconds
                            d[a].temperatureHighTime = d[a].temperatureHighTime * 1000; // Convert to milliseconds
                            d[a].windGustTime = d[a].windGustTime * 1000; // Convert to milliseconds
                            d[a].precipIntensityMaxTime = d[a].precipIntensityMaxTime * 1000; // Convert to milliseconds
                            d[a].uvIndexTime = d[a].uvIndexTime * 1000;
                        }
                        d[a].iconUrl = this.getIconUrl(d[a].icon);
                        d[a].time = d[a].time * 1000; // Convert to milliseconds
                    }
                }
            }
            if (!this.config.minutes) {
                // Remove minute-by-minute data if not configured
                delete data.minutely;
            }
            data.lastUpdate = Date.now();
            await this.library.writeFromJson('weather', 'weather', genericStateObjects, data, true);
        } else {
            throw new Error({ status: response.status, statusText: response.statusText } as any);
        }
    };

    private getIconUrl(icon: string): string {
        // Set der vorhandenen Basis-Icons
        const baseIcons = new Set([
            'clear-day',
            'clear-night',
            'rain',
            'snow',
            'sleet',
            'wind',
            'fog',
            'cloudy',
            'partly-cloudy-day',
            'partly-cloudy-night',
            'thunderstorm',
            'hail',
            'flurries',
            'breezy',
            'dangerous-wind',
            'mist',
            'smoke',
            'drizzle',
            'not-available',
            'possible-drizzle-night',
            'possible-fog-day',
            'possible-fog-night',
            'possible-hail-day',
            'possible-hail-night',
            'possible-haze-day',
            'possible-haze-night',
            'possible-rain-day',
            'possible-rain-night',
            'possible-sleet-day',
            'possible-sleet-night',
            'possible-smoke-day',
            'possible-smoke-night',
            'possible-snow-day',
            'possible-snow-night',
        ]);
        // Mapping für Aliase auf Basis-Icons
        const aliasMap: Record<string, string> = {
            'light-rain': 'rain',
            'heavy-rain': 'rain',
            'possible-precipitation-day': 'rain',
            'possible-precipitation-night': 'rain',
            precipitation: 'rain',
            'mostly-clear-day': 'clear-day',
            'mostly-clear-night': 'clear-night',
            'mostly-cloudy-day': 'cloudy',
            'mostly-cloudy-night': 'cloudy',
            'very-light-sleet': 'sleet',
            'light-sleet': 'sleet',
            'heavy-sleet': 'sleet',
            'light-snow': 'snow',
            'heavy-snow': 'snow',
            mixed: 'rain',
            none: 'not-available',
            'Not Available': 'not-available',
        };
        let file = 'not-available';
        if (baseIcons.has(icon)) {
            file = icon;
        } else if (icon in aliasMap) {
            file = aliasMap[icon];
        }
        return `/adapter/${this.name}/icons/icebear/${file}.svg`;
    }

    private onUnload(callback: () => void): void {
        try {
            this.unload = true;
            void this.setState('info.connection', false, true);
            if (this.getWeatherLoopTimeout) {
                this.clearTimeout(this.getWeatherLoopTimeout);
            }
            if (this.controller) {
                this.controller.abort();
                this.controller = null;
            }
            if (this.timeoutId) {
                this.clearTimeout(this.timeoutId);
                this.timeoutId = undefined;
            }

            callback();
        } catch {
            callback();
        }
    }
    private getWindBearingText(windBearing: number | undefined): string {
        if (windBearing === undefined) {
            return '';
        }
        const directions = [
            'N',
            'NNE',
            'NE',
            'ENE',
            'E',
            'ESE',
            'SE',
            'SSE',
            'S',
            'SSW',
            'SW',
            'WSW',
            'W',
            'WNW',
            'NW',
            'NNW',
        ];
        const index = Math.round((windBearing % 360) / 22.5) % 16;
        return directions[index];
    }
    async fetch(url: string, init?: RequestInit): Promise<Response> {
        this.controller = new AbortController();
        this.timeoutId = this.setTimeout(() => {
            this.controller && this.controller.abort();
            this.controller = null;
        }, 30000); // 30 seconds timeout

        try {
            const response = await fetch(url, {
                ...init,
                method: init?.method ?? 'GET',
                signal: this.controller.signal,
            });

            // Clear the timeout since the request completed
            this.clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
            this.controller = null;
            return response;
        } catch (error) {
            this.clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
            this.controller = null;
            throw error;
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new PirateWeather(options);
} else {
    // otherwise start the instance directly
    (() => new PirateWeather())();
}
