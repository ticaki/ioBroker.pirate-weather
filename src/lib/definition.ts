/*type ChangeTypeToChannelAndState<Obj> = Obj extends object
    ? {
          [K in keyof Obj]-?: ChangeTypeToChannelAndState<Obj[K]>;
      } & customChannelType
    : ioBroker.StateObject;
export type ChangeToChannel<Obj, T> = Obj extends object
    ? { [K in keyof Obj]-?: customChannelType & T }
    : ioBroker.StateObject;
*/
export type ChangeTypeOfKeysForState<Obj, N> = Obj extends object
    ? customChannelType & { [K in keyof Obj]: ChangeTypeOfKeysForState<Obj[K], N> }
    : N;
export type customChannelType = {
    _channel?: ioBroker.ChannelObject | ioBroker.DeviceObject | ioBroker.FolderObject;
    _array?: ioBroker.ChannelObject | ioBroker.DeviceObject | ioBroker.FolderObject;
};

const StormData: ChangeTypeOfKeysForState<StormData, ioBroker.StateObject> = {
    nearestStormDistance: {
        _id: '',
        type: 'state',
        common: {
            name: 'Nearest Storm Distance',
            type: 'number',
            role: 'value.distance',
            read: true,
            write: false,
            unit: 'km',
        },
        native: {},
    },
    nearestStormBearing: {
        _id: '',
        type: 'state',
        common: {
            name: 'Nearest Storm Bearing',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '°',
        },
        native: {},
    },
};

const TemperatureData: ChangeTypeOfKeysForState<TemperatureData, ioBroker.StateObject> = {
    temperature: {
        _id: '',
        type: 'state',
        common: {
            name: 'Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
        native: {},
    },
    apparentTemperature: {
        _id: '',
        type: 'state',
        common: {
            name: 'Apparent Temperature',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
        native: {},
    },
    dewPoint: {
        _id: '',
        type: 'state',
        common: {
            name: 'Dew Point',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
        native: {},
    },
    humidity: {
        _id: '',
        type: 'state',
        common: {
            name: 'Humidity',
            type: 'number',
            role: 'value.humidity',
            read: true,
            write: false,
            unit: '%',
        },
        native: {},
    },
    feelsLike: {
        _id: '',
        type: 'state',
        common: {
            name: 'Feels Like',
            type: 'number',
            role: 'value.temperature',
            read: true,
            write: false,
            unit: '°C',
        },
        native: {},
    },
};
const WindData: ChangeTypeOfKeysForState<WindData, ioBroker.StateObject> = {
    windSpeed: {
        _id: '',
        type: 'state',
        common: {
            name: 'Wind Speed',
            type: 'number',
            role: 'value.speed.wind',
            read: true,
            write: false,
            unit: 'm/s',
        },
        native: {},
    },
    windGust: {
        _id: '',
        type: 'state',
        common: {
            name: 'Wind Gust',
            type: 'number',
            role: 'value.speed.wind.gust',
            read: true,
            write: false,
            unit: 'm/s',
        },
        native: {},
    },
    windBearing: {
        _id: '',
        type: 'state',
        common: {
            name: 'Wind Bearing',
            type: 'number',
            role: 'value.direction.wind',
            read: true,
            write: false,
            unit: '°',
        },
        native: {},
    },
    windBearingText: {
        _id: '',
        type: 'state',
        common: {
            name: 'Wind Bearing Text',
            type: 'string',
            role: 'weather.direction.wind',
            read: true,
            write: false,
        },
        native: {},
    },
};
const PressureVisibilityOzoneData: ChangeTypeOfKeysForState<PressureVisibilityOzoneData, ioBroker.StateObject> = {
    pressure: {
        _id: '',
        type: 'state',
        common: {
            name: 'Pressure',
            type: 'number',
            role: 'value.pressure',
            read: true,
            write: false,
            unit: 'hPa',
        },
        native: {},
    },
    visibility: {
        _id: '',
        type: 'state',
        common: {
            name: 'Visibility',
            type: 'number',
            role: 'value.distance.visibility',
            read: true,
            write: false,
            unit: 'km',
        },
        native: {},
    },
    ozone: {
        _id: '',
        type: 'state',
        common: {
            name: 'Ozone',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'DU',
        },
        native: {},
    },
    smoke: {
        _id: '',
        type: 'state',
        common: {
            name: 'Smoke',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
        },
        native: {},
    },
};
const CloudUvData: ChangeTypeOfKeysForState<CloudUvData, ioBroker.StateObject> = {
    cloudCover: {
        _id: '',
        type: 'state',
        common: {
            name: 'Cloud Cover',
            type: 'number',
            role: 'value.clouds',
            read: true,
            write: false,
            unit: '%',
        },
        native: {},
    },
    uvIndex: {
        _id: '',
        type: 'state',
        common: {
            name: 'UV Index',
            type: 'number',
            role: 'value.uv',
            read: true,
            write: false,
        },
        native: {},
    },
    fireIndex: {
        _id: '',
        type: 'state',
        common: {
            name: 'Fire Index',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
        },
        native: {},
    },
};

const MetaData: ChangeTypeOfKeysForState<MetaData, ioBroker.StateObject> = {
    summary: {
        _id: '',
        type: 'state',
        common: {
            name: 'Summary',
            type: 'string',
            role: 'weather.title',
            read: true,
            write: false,
        },
        native: {},
    },
    icon: {
        _id: '',
        type: 'state',
        common: {
            name: 'Icon',
            type: 'string',
            role: 'weather.icon.name',
            read: true,
            write: false,
        },
        native: {},
    },
};
const PrecipitationData: ChangeTypeOfKeysForState<PrecipitationData, ioBroker.StateObject> = {
    precipIntensity: {
        _id: '',
        type: 'state',
        common: {
            name: 'Precipitation Intensity',
            type: 'number',
            role: 'value.precipitation',
            read: true,
            write: false,
            unit: 'mm/h',
        },
        native: {},
    },
    precipProbability: {
        _id: '',
        type: 'state',
        common: {
            name: 'Precipitation Probability',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: '%',
        },
        native: {},
    },
    precipIntensityError: {
        _id: '',
        type: 'state',
        common: {
            name: 'Precipitation Intensity Error',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'mm',
        },
        native: {},
    },
    precipAccumulation: {
        _id: '',
        type: 'state',
        common: {
            name: 'Precipitation Accumulation',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'cm',
        },
        native: {},
    },
    precipType: {
        _id: '',
        type: 'state',
        common: {
            name: 'Precipitation Type',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
        native: {},
    },
    liquidAccumulation: {
        _id: '',
        type: 'state',
        common: {
            name: 'Liquid Accumulation',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'cm',
        },
        native: {},
    },
    snowAccumulation: {
        _id: '',
        type: 'state',
        common: {
            name: 'Snow Accumulation',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'cm',
        },
        native: {},
    },
    iceAccumulation: {
        _id: '',
        type: 'state',
        common: {
            name: 'Ice Accumulation',
            type: 'number',
            role: 'value',
            read: true,
            write: false,
            unit: 'cm',
        },
        native: {},
    },
};

export const defaultChannel: ioBroker.ChannelObject = {
    _id: '',
    type: 'channel',
    common: {
        name: 'Hey no description... ',
    },
    native: {},
};

export const genericStateObjects: {
    default: ioBroker.StateObject;
    customString: ioBroker.StateObject;
    weather: customChannelType & {
        hourly: customChannelType &
            ChangeTypeOfKeysForState<MetaData, ioBroker.StateObject> &
            ChangeTypeOfKeysForState<HourlyData, ioBroker.StateObject>;
        daily: customChannelType &
            ChangeTypeOfKeysForState<MetaData, ioBroker.StateObject> &
            ChangeTypeOfKeysForState<DailyData, ioBroker.StateObject>;
        minutely: customChannelType &
            ChangeTypeOfKeysForState<MetaData, ioBroker.StateObject> &
            ChangeTypeOfKeysForState<MinutelyData, ioBroker.StateObject>;
        currently: customChannelType & ChangeTypeOfKeysForState<CurrentlyData, ioBroker.StateObject>;
        latitude: ioBroker.StateObject;
        lastUpdate: ioBroker.StateObject;
        longitude: ioBroker.StateObject;
        timezone: ioBroker.StateObject;
        offset: ioBroker.StateObject;
        elevation: ioBroker.StateObject;
        'nearest-station'?: ioBroker.StateObject;
        version: ioBroker.StateObject;
        units: ioBroker.StateObject;
    };
} = {
    default: {
        _id: 'No_definition',
        type: 'state',
        common: {
            name: 'StateObjects.state',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
        native: {},
    },

    customString: {
        _id: 'User_State',
        type: 'state',
        common: {
            name: 'StateObjects.customString',
            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
        native: {},
    },
    weather: {
        _channel: {
            _id: '',
            type: 'folder',
            common: {
                name: 'Weather',
            },
            native: {},
        },
        hourly: {
            ...PrecipitationData,
            ...MetaData,
            ...WindData,
            ...TemperatureData,
            ...PressureVisibilityOzoneData,
            ...CloudUvData,
            ...StormData,
            _channel: {
                _id: '',
                type: 'folder',
                common: {
                    name: 'Hourly',
                },
                native: {},
            },
            _array: {
                _id: '',
                type: 'folder',
                common: {
                    name: 'Hourly',
                },
                native: {},
            },
            time: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Date in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
        },
        daily: {
            ...WindData,
            ...MetaData,
            _channel: {
                _id: '',
                type: 'folder',
                common: {
                    name: 'Daily',
                },
                native: {},
            },
            _array: {
                _id: '',
                type: 'folder',
                common: {
                    name: 'Daily',
                },
                native: {},
            },
            time: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Date in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            sunriseTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Sunrise Time in Milliseconds',
                    type: 'number',
                    role: 'date.sunrise',
                    read: true,
                    write: false,
                },
                native: {},
            },
            sunsetTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Sunset Time in Milliseconds',
                    type: 'number',
                    role: 'date.sunset',
                    read: true,
                    write: false,
                },
                native: {},
            },
            moonPhase: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Moon Phase',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                    unit: '%',
                },
                native: {},
            },
            precipIntensity: PrecipitationData.precipIntensity,
            precipIntensityMax: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Precipitation Intensity',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                    unit: 'mm/h',
                },
                native: {},
            },
            precipIntensityMaxTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Precipitation Intensity Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            precipProbability: PrecipitationData.precipProbability,
            precipAccumulation: PrecipitationData.precipAccumulation,
            precipType: PrecipitationData.precipType,
            temperatureHigh: {
                _id: '',
                type: 'state',
                common: {
                    name: 'High Temperature',
                    type: 'number',
                    role: 'value.temperature.max',
                    read: true,
                    write: false,
                    unit: '°C',
                },
                native: {},
            },
            temperatureHighTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'High Temperature Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            temperatureLow: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Low Temperature',
                    type: 'number',
                    role: 'value.temperature.min',
                    read: true,
                    write: false,
                    unit: '°C',
                },
                native: {},
            },
            temperatureLowTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Low Temperature Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            apparentTemperatureHigh: {
                _id: '',
                type: 'state',
                common: {
                    name: 'High Apparent Temperature',
                    type: 'number',
                    role: 'value.temperature.max',
                    read: true,
                    write: false,
                    unit: '°C',
                },
                native: {},
            },
            apparentTemperatureHighTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'High Apparent Temperature Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            apparentTemperatureLow: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Low Apparent Temperature',
                    type: 'number',
                    role: 'value.temperature.min',
                    read: true,
                    write: false,
                    unit: '°C',
                },
                native: {},
            },
            apparentTemperatureLowTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Low Apparent Temperature Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            dewPoint: TemperatureData.dewPoint,
            humidity: TemperatureData.humidity,
            pressure: PressureVisibilityOzoneData.pressure,
            windGustTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Wind Gust Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            cloudCover: CloudUvData.cloudCover,
            uvIndex: CloudUvData.uvIndex,
            uvIndexTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'UV Index Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                    unit: '%',
                },
                native: {},
            },
            visibility: PressureVisibilityOzoneData.visibility,
            temperatureMin: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Minimum Daytime Temperature',
                    type: 'number',
                    role: 'value.temperature.min',
                    read: true,
                    write: false,
                    unit: '°C',
                },
                native: {},
            },
            temperatureMinTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Minimum Daytime Temperature Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            temperatureMax: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Daytime Temperature',
                    type: 'number',
                    role: 'value.temperature.max',
                    read: true,
                    write: false,
                    unit: '°C',
                },
                native: {},
            },
            temperatureMaxTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Daytime Temperature Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            apparentTemperatureMin: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Minimum Apparent Temperature',
                    type: 'number',
                    role: 'value.temperature.min',
                    read: true,
                    write: false,
                    unit: '°C',
                },
                native: {},
            },
            apparentTemperatureMinTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Minimum Apparent Temperature Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            apparentTemperatureMax: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Apparent Temperature',
                    type: 'number',
                    role: 'value.temperature.max',
                    read: true,
                    write: false,
                    unit: '°C',
                },
                native: {},
            },
            apparentTemperatureMaxTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Apparent Temperature Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            dawnTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Dawn Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            duskTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Dusk Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            smokeMax: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Smoke',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            },
            smokeMaxTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Smoke Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            liquidAccumulation: PrecipitationData.liquidAccumulation,
            snowAccumulation: PrecipitationData.snowAccumulation,
            iceAccumulation: PrecipitationData.iceAccumulation,
            fireIndexMax: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Fire Index',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            },
            fireIndexMaxTime: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Maximum Fire Index Time in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
        },
        minutely: {
            ...MetaData,
            _channel: {
                _id: '',
                type: 'folder',
                common: {
                    name: 'Minutely',
                },
                native: {},
            },
            _array: {
                _id: '',
                type: 'folder',
                common: {
                    name: 'Minutely',
                },
                native: {},
            },
            time: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Date in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },
            precipIntensity: PrecipitationData.precipIntensity,
            precipProbability: PrecipitationData.precipProbability,
            precipIntensityError: PrecipitationData.precipIntensityError,
            precipType: PrecipitationData.precipType,
        },
        currently: {
            ...WindData,
            ...PrecipitationData,
            ...TemperatureData,
            ...PressureVisibilityOzoneData,
            ...CloudUvData,
            ...MetaData,
            ...StormData,
            _channel: {
                _id: '',
                type: 'folder',
                common: {
                    name: 'Currently',
                },
                native: {},
            },
            time: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Date in Milliseconds',
                    type: 'number',
                    role: 'date',
                    read: true,
                    write: false,
                },
                native: {},
            },

            currentDayIce: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Current Day Ice',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                    unit: 'cm',
                },
                native: {},
            },
            currentDayLiquid: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Current Day Liquid',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                    unit: 'cm',
                },
                native: {},
            },
            currentDaySnow: {
                _id: '',
                type: 'state',
                common: {
                    name: 'Current Day Snow',
                    type: 'number',
                    role: 'value',
                    read: true,
                    write: false,
                    unit: 'cm',
                },
                native: {},
            },
        },
        latitude: {
            _id: '',
            type: 'state',
            common: {
                name: 'Latitude',
                type: 'number',
                role: 'value.gps.latitude',
                read: true,
                write: false,
                unit: '°',
            },
            native: {},
        },
        lastUpdate: {
            _id: '',
            type: 'state',
            common: {
                name: 'Last Update',
                type: 'number',
                role: 'date',
                read: true,
                write: false,
            },
            native: {},
        },
        longitude: {
            _id: '',
            type: 'state',
            common: {
                name: 'Longitude',
                type: 'number',
                role: 'value.gps.longitude',
                read: true,
                write: false,
                unit: '°',
            },
            native: {},
        },
        timezone: {
            _id: '',
            type: 'state',
            common: {
                name: 'Timezone',
                type: 'string',
                role: 'text',
                read: true,
                write: false,
            },
            native: {},
        },
        offset: {
            _id: '',
            type: 'state',
            common: {
                name: 'Timezone Offset',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
                unit: 'h',
            },
            native: {},
        },
        elevation: {
            _id: '',
            type: 'state',
            common: {
                name: 'Elevation',
                type: 'number',
                role: 'value.elevation',
                read: true,
                write: false,
                unit: 'm',
            },
            native: {},
        },
        'nearest-station': {
            _id: '',
            type: 'state',
            common: {
                name: 'Nearest Station',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
            },
            native: {},
        },
        version: {
            _id: '',
            type: 'state',
            common: {
                name: 'API Version',
                type: 'string',
                role: 'text',
                read: true,
                write: false,
            },
            native: {},
        },
        units: {
            _id: '',
            type: 'state',
            common: {
                name: 'Units',
                type: 'string',
                role: 'text',
                read: true,
                write: false,
            },
            native: {},
        },
    },
};

export const Defaults = {
    state: {
        _id: 'No_definition',
        type: 'state',
        common: {
            name: 'No definition',

            type: 'string',
            role: 'text',
            read: true,
            write: false,
        },
        native: {},
    },
};

// ...existing code...

// ...existing code...

// Gemeinsame Typen für Wetterdaten
export type WindData = {
    windSpeed: number;
    windGust: number;
    windBearing: number;
    windBearingText: string;
};

export type PrecipitationData = {
    precipIntensity: number;
    precipProbability: number;
    precipIntensityError: number;
    precipAccumulation: number;
    precipType: string;
    liquidAccumulation: number;
    snowAccumulation: number;
    iceAccumulation: number;
};

export type TemperatureData = {
    temperature: number;
    apparentTemperature: number;
    dewPoint: number;
    humidity: number;
    feelsLike: number;
};

export type StormData = {
    nearestStormDistance: number;
    nearestStormBearing: number;
};

export type PressureVisibilityOzoneData = {
    pressure: number;
    visibility: number;
    ozone: number;
    smoke: number;
};

export type CloudUvData = {
    cloudCover: number;
    uvIndex: number;
    fireIndex: number;
};

export type CurrentlyData = WindData &
    PrecipitationData &
    TemperatureData &
    PressureVisibilityOzoneData &
    MetaData &
    StormData &
    CloudUvData & {
        time: number;
        summary: string;
        icon: string;
        currentDayIce: number;
        currentDayLiquid: number;
        currentDaySnow: number;
    };

export type MinutelyData = {
    time: number;
    precipIntensity: number;
    precipProbability: number;
    precipIntensityError: number;
    precipType: string;
};

export type HourlyData = WindData &
    PrecipitationData &
    TemperatureData &
    PressureVisibilityOzoneData &
    CloudUvData &
    MetaData & {
        time: number;
    };

export type DailyData = WindData &
    MetaData & {
        time: number;
        sunriseTime: number;
        sunsetTime: number;
        moonPhase: number;
        precipIntensity: number;
        precipIntensityMax: number;
        precipIntensityMaxTime: number;
        precipProbability: number;
        precipAccumulation: number;
        precipType: string;
        temperatureHigh: number;
        temperatureHighTime: number;
        temperatureLow: number;
        temperatureLowTime: number;
        apparentTemperatureHigh: number;
        apparentTemperatureHighTime: number;
        apparentTemperatureLow: number;
        apparentTemperatureLowTime: number;
        dewPoint: number;
        humidity: number;
        pressure: number;
        windGustTime: number;
        cloudCover: number;
        uvIndex: number;
        uvIndexTime: number;
        visibility: number;
        temperatureMin: number;
        temperatureMinTime: number;
        temperatureMax: number;
        temperatureMaxTime: number;
        apparentTemperatureMin: number;
        apparentTemperatureMinTime: number;
        apparentTemperatureMax: number;
        apparentTemperatureMaxTime: number;
        dawnTime: number;
        duskTime: number;
        smokeMax: number;
        smokeMaxTime: number;
        liquidAccumulation: number;
        snowAccumulation: number;
        iceAccumulation: number;
        fireIndexMax: number;
        fireIndexMaxTime: number;
    };
type MetaData = {
    summary: string;
    icon: string;
};
// Haupttyp
export type PirateWeatherTestdata = {
    lastUpdate?: number;
    latitude: number;
    longitude: number;
    timezone: string;
    offset: number;
    elevation: number;
    units?: string;
    'nearest-station'?: number;
    version?: string;
    currently: CurrentlyData;
    minutely?: MetaData & {
        data: MinutelyData[];
    };
    hourly: MetaData & {
        data: HourlyData[];
    };
    daily: MetaData & {
        data: DailyData[];
    };
    flags?: {
        sources: string[];
        sourceTimes: { [key: string]: string };
        'nearest-station': number;
        units: string;
        version: string;
    };
};

export function setUnits(u: 'si' | 'us' | 'ca' | 'uk'): void {
    switch (u) {
        default:
        case 'si': {
            break;
        }
        case 'us': {
            TemperatureData.apparentTemperature.common.unit = '°F';
            TemperatureData.dewPoint.common.unit = '°F';
            TemperatureData.temperature.common.unit = '°F';
            WindData.windSpeed.common.unit = 'mph';
            WindData.windGust.common.unit = 'mph';
            PressureVisibilityOzoneData.pressure.common.unit = 'mbar';
            PressureVisibilityOzoneData.visibility.common.unit = 'mi';
            PrecipitationData.precipIntensity.common.unit = 'in/h';
            PrecipitationData.liquidAccumulation.common.unit = 'in';
            PrecipitationData.snowAccumulation.common.unit = 'in';
            PrecipitationData.iceAccumulation.common.unit = 'in';
            PrecipitationData.precipAccumulation.common.unit = 'in';
            genericStateObjects.weather.daily.temperatureHigh.common.unit = '°F';
            genericStateObjects.weather.daily.temperatureLow.common.unit = '°F';
            genericStateObjects.weather.daily.apparentTemperatureHigh.common.unit = '°F';
            genericStateObjects.weather.daily.apparentTemperatureLow.common.unit = '°F';
            genericStateObjects.weather.daily.temperatureMin.common.unit = '°F';
            genericStateObjects.weather.daily.temperatureMax.common.unit = '°F';
            genericStateObjects.weather.daily.apparentTemperatureMin.common.unit = '°F';
            genericStateObjects.weather.daily.apparentTemperatureMax.common.unit = '°F';
            genericStateObjects.weather.daily.precipIntensity.common.unit = 'in/h';
            genericStateObjects.weather.daily.precipAccumulation.common.unit = 'in';
            genericStateObjects.weather.daily.precipIntensityMax.common.unit = 'in/h';
            genericStateObjects.weather.currently.nearestStormDistance.common.unit = 'mi';
            genericStateObjects.weather.elevation.common.unit = 'ft';

            break;
        }
        case 'ca': {
            WindData.windSpeed.common.unit = 'km/h';
            WindData.windGust.common.unit = 'km/h';
            genericStateObjects.weather.daily.precipAccumulation.common.unit = 'mm';
            PrecipitationData.precipAccumulation.common.unit = 'mm';
            PrecipitationData.snowAccumulation.common.unit = 'mm';
            PrecipitationData.iceAccumulation.common.unit = 'mm';
            PrecipitationData.precipAccumulation.common.unit = 'mm';
            genericStateObjects.weather.daily.snowAccumulation.common.unit = 'mm';
            genericStateObjects.weather.daily.liquidAccumulation.common.unit = 'mm';
            genericStateObjects.weather.daily.iceAccumulation.common.unit = 'mm';

            break;
        }
        case 'uk': {
            WindData.windSpeed.common.unit = 'mph';
            WindData.windGust.common.unit = 'mph';
            genericStateObjects.weather.currently.nearestStormDistance.common.unit = 'mi';
            break;
        }
    }
}
// ...existing code...

// ...existing code...
