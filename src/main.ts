/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import axios from 'axios';
import 'source-map-support/register';
import { Library } from './lib/library';
import { genericStateObjects, setUnits, type PirateWeatherTestdata } from './lib/definition';

axios.defaults.timeout = 30000; // Set a default timeout of 10 seconds for all axios requests

class PirateWeather extends utils.Adapter {
    library: Library;
    unload: boolean = false;
    online: boolean | null = null;
    getWeatherLoopTimeout: ioBroker.Timeout | undefined | null = null;
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
            if (error.code !== 'ECONNABORTED') {
                this.log.error(`Error in getPirateWeatherLoop: ${JSON.stringify(error)}`);
            }
            await this.setState('info.connection', false, true);
            if (this.online !== false) {
                this.log.warn('Pirate Weather is offline. Retrying in 10 minutes.');
            }
            this.online = false;
            errorState = true; // Set error to true to trigger the retry logic
        } finally {
            let loopTime = 600000 + Date.now();
            if (this.config.pollingInMinutes) {
                loopTime = new Date().setMinutes(new Date().getMinutes() + this.config.pollIntervalMinutes, 0);
                if (new Date(loopTime).getHours() > new Date().getHours()) {
                    loopTime = new Date().setHours(new Date().getHours() + 1, 0, 0);
                }
            } else if (!errorState) {
                loopTime = new Date().setHours(new Date().getHours() + this.config.pollInterval, 0, 0);
            }
            loopTime += 500 + Math.ceil(Math.random() * 3000); // Add a random delay of up to 3 second

            this.getWeatherLoopTimeout = this.setTimeout(() => {
                void this.getPirateWeatherLoop();
            }, loopTime - Date.now());
        }
    };

    getData = async (): Promise<void> => {
        const result = await axios.get(
            `https://api.pirateweather.net/forecast/${this.config.apiToken}/${this.config.position}?units=${this.config.units || 'si'}&icon=pirate`,
        );
        if (result.status === 200) {
            const data = result.data as PirateWeatherTestdata;
            this.log.debug(`Data fetched successfully: ${JSON.stringify(data)}`);
            if (data.flags) {
                data.units = data.flags.units;
                data['nearest-station'] = data.flags['nearest-station'];
                data.version = data.flags.version;
                delete data.flags;
                delete result.data.flags;
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
                        d[a].windBearingText = this.getWindBearingText(d[a].windBearing);
                        d[a].cloudCover = Math.round(d[a].cloudCover * 100);
                        d[a].precipProbability = Math.round(d[a].precipProbability * 100);
                        d[a].humidity = Math.round(d[a].humidity * 100);
                        if (d === data.daily.data) {
                            d[a].moonPhase = Math.round(d[a].moonPhase * 100);
                        }
                    }
                }
            }
            if (!this.config.minutes) {
                // Remove minute-by-minute data if not configured
                delete data.minutely;
            }
            await this.library.writeFromJson('weather', 'weather', genericStateObjects, data, true);
        }
    };

    private onUnload(callback: () => void): void {
        try {
            void this.setState('info.connection', false, true);
            if (this.getWeatherLoopTimeout) {
                this.clearTimeout(this.getWeatherLoopTimeout);
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
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new PirateWeather(options);
} else {
    // otherwise start the instance directly
    (() => new PirateWeather())();
}
