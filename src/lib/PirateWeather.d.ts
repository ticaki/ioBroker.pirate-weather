import * as utils from '@iobroker/adapter-core';
import type { Library } from './library';

declare class PirateWeather extends utils.Adapter {
    library: Library;
    unload: boolean;
}
