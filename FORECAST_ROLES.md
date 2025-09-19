# Weather Forecast Role Transformations

This document explains the changes made to support type-detector compatibility for weather forecasts.

## Problem

The original adapter created weather states with standard roles (e.g., `value.temperature`, `value.humidity`) but did not include the `.forecast.{index}` suffix required by ioBroker's type-detector for weather forecast devices. This prevented the adapter from being recognized as a weather forecast device for use in Lovelace UI and other visualization tools.

## Solution

Modified the `Library` class in `src/lib/library.ts` to automatically detect and transform roles when processing forecast data arrays (daily and hourly).

## Key Changes

### 1. Enhanced `getObjectDefFromJson` Method

Added optional `forecastContext` parameter to detect forecast processing and apply role transformations:

```typescript
async getObjectDefFromJson(
    key: string, 
    def: any, 
    data: any, 
    forecastContext?: { isForecast: boolean; index: number; type: 'daily' | 'hourly' }
): Promise<ioBroker.Object>
```

### 2. Modified `writeFromJson` Method

Added logic to detect when processing daily/hourly data arrays and pass forecast context:

```typescript
// Detect if we're in a forecast context (daily or hourly arrays)
const isForecastContext = this.isForecastArray(prefix, objNode);
const forecastType = this.getForecastType(prefix, objNode);
```

### 3. New `applyForecastRole` Method

Comprehensive role transformation logic that maps standard roles to forecast roles:

```typescript
private applyForecastRole(
    stateObj: ioBroker.Object, 
    forecastContext: { index: number; type: 'daily' | 'hourly' }
): ioBroker.Object
```

## Role Transformations

### Daily Forecasts

| Original Role | Transformed Role | Notes |
|---------------|------------------|-------|
| `value.temperature.max` | `value.temperature.max.forecast.{index}` | Required by type-detector |
| `value.temperature.min` | `value.temperature.min.forecast.{index}` | Required by type-detector |
| `weather.icon.name` | `weather.icon.forecast.{index}` | **Mandatory** for type-detector |
| `value.humidity` | `value.humidity.forecast.{index}` | |
| `value.pressure` | `value.pressure.forecast.{index}` | |
| `value.precipitation` | `value.precipitation.forecast.{index}` | |
| `value.speed.wind` | `value.speed.wind.forecast.{index}` | |
| `weather.direction.wind` | `weather.direction.wind.forecast.{index}` | |
| `weather.title` | `weather.state.forecast.{index}` | |
| `date` | `date.forecast.{index}` | |
| `date.sunrise` | `date.sunrise.forecast.{index}` | |
| `date.sunset` | `date.sunset.forecast.{index}` | |

### Hourly Forecasts

All roles get the `.forecast.{index}` suffix:

| Original Role | Transformed Role |
|---------------|------------------|
| `value.temperature` | `value.temperature.forecast.{index}` |
| `weather.icon.name` | `weather.icon.forecast.{index}` |
| `value.humidity` | `value.humidity.forecast.{index}` |
| `value.pressure` | `value.pressure.forecast.{index}` |
| And all other standard weather roles... |

## Type-Detector Requirements Met

The implementation ensures all mandatory type-detector requirements are fulfilled:

### Required Roles (R column marked with *)
- ✅ `weather.icon.forecast.0` (mandatory weather icon)
- ✅ `value.temperature.min.forecast.0` (minimum temperature)  
- ✅ `value.temperature.max.forecast.0` (maximum temperature)

### Optional But Valuable Roles
- ✅ `value.precipitation.forecast.{index}` (precipitation chance/amount)
- ✅ `value.humidity.forecast.{index}` (humidity)
- ✅ `value.pressure.forecast.{index}` (pressure)
- ✅ `value.speed.wind.forecast.{index}` (wind speed)
- ✅ `value.direction.wind.forecast.{index}` (wind direction)
- ✅ `weather.direction.wind.forecast.{index}` (wind direction text)
- ✅ `weather.state.forecast.{index}` (weather state/summary)
- ✅ `date.forecast.{index}` (forecast date)

## Impact

With these changes:

1. **Type-detector compatibility**: The adapter will now be recognized as a weather forecast device
2. **Lovelace UI support**: Can be used in Home Assistant Lovelace UI via ioBroker integration
3. **Visualization support**: Compatible with other weather visualization tools that use type-detector
4. **Backward compatibility**: Existing functionality remains unchanged
5. **Automatic operation**: No configuration needed - transformations happen automatically

## Testing

The implementation includes:
- ✅ TypeScript compilation
- ✅ ESLint compliance  
- ✅ Basic functional test
- ✅ Role transformation verification

## State Structure Example

After transformation, the adapter will create states like:

```
pirate-weather.0.weather.daily.00.icon               (role: weather.icon.forecast.0)
pirate-weather.0.weather.daily.00.temperatureHigh   (role: value.temperature.max.forecast.0)  
pirate-weather.0.weather.daily.00.temperatureLow    (role: value.temperature.min.forecast.0)
pirate-weather.0.weather.daily.00.humidity          (role: value.humidity.forecast.0)
pirate-weather.0.weather.daily.01.icon              (role: weather.icon.forecast.1)
pirate-weather.0.weather.daily.01.temperatureHigh   (role: value.temperature.max.forecast.1)
...and so on for each forecast day/hour
```

This structure matches exactly what type-detector expects for weather forecast devices.