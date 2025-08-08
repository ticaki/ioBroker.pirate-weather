/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import axios from 'axios';
import 'source-map-support/register';
import {Library} from './lib/library';
import {genericStateObjects} from './lib/definition';

// Load your modules here, e.g.:
// import * as fs from "fs";

class PirateWeather extends utils.Adapter {
    library: Library;
    unload: boolean = false;
    getWeatherLoopTimeout: ioBroker.Timeout | undefined | null = null;
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'pirate-weather',
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
    private async onReady (): Promise<void> {
        if (this.config.pollInterval < 1) {
            this.log.warn(`Invalid poll interval: ${this.config.pollInterval}. Using default value of 1 hour.`);
            this.config.pollInterval = 1; // Default to 1 minute if invalid
        }
        if (!this.config.apiToken) {
            this.log.error('API token is not set in the adapter configuration. Please set it in the adapter settings.');
            return;
        }
        if (!this.config.position || typeof this.config.position !== 'string' || !this.config.position.split(',').every(coord => !isNaN(parseFloat(coord)))) {
            this.log.error('Position is not set in the adapter configuration. Please set it in the adapter settings.');
            return;
        }
        await this.library.init();
        const states = await this.getStatesAsync('*');
        await this.library.initStates(states);
        this.getPirateWeatherLoop();
    }

    getPirateWeatherLoop = async (): Promise<void> => {
        try {
            if (this.getWeatherLoopTimeout) {
                this.clearTimeout(this.getWeatherLoopTimeout);
            }
            await this.getData();
        } catch (error) {
            this.log.error(`Error in getPirateWeatherLoop: ${error}`);
        } finally {
            const loopTime = new Date().setHours(new Date().getHours() + this.config.pollInterval);
            this.getWeatherLoopTimeout = this.setTimeout(() => {
                this.getPirateWeatherLoop();
            }, loopTime - Date.now()); // Convert hours to milliseconds
        }
    }

    getData = async (): Promise<void> => {
        try {
            const result = await axios.get(`https://api.pirateweather.net/forecast/${this.config.apiToken}/${this.config.position}?units=${this.config.units || 'si'}`);
            if (result.status === 200) {
                this.log.debug(`Data fetched successfully: ${JSON.stringify(result.data)}`);
                result.data.units = result.data.flags.units;
                result.data['nearest-station'] = result.data.flags['nearest-station'];
                result.data.version = result.data.flags.version;
                delete result.data.flags;
                await this.library.writeFromJson('weather', '', genericStateObjects, result.data, true);
            }
        } catch (error) {
            this.log.error(`Error fetching data from Pirate Weather API: ${error}`);
        }
    };


    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback
     */
    private onUnload (callback: () => void): void {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);

            callback();
        } catch {
            callback();
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
