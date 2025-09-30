import * as SunCalc from 'suncalc';

/**
 * Convert milliseconds to human-readable format HH:MM:SS
 *
 * @param milliseconds Duration in milliseconds
 * @returns Formatted string in HH:MM:SS format
 */
export function formatDuration(milliseconds: number): string {
    const totalSeconds = Math.round(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculate astronomy data for a given date and location
 *
 * @param date The date for which to calculate astronomy data
 * @param latitude The latitude of the location
 * @param longitude The longitude of the location
 * @returns Object with astronomy data in milliseconds
 */
export function calculateAstronomyData(
    date: Date,
    latitude: number,
    longitude: number,
): {
    civilDawn: number;
    civilDusk: number;
    nauticalDawn: number;
    nauticalDusk: number;
    astronomicalDawn: number;
    astronomicalDusk: number;
    dayLength: number;
    dayLengthFormatted: string;
    nightLength: number;
    nightLengthFormatted: string;
    solarNoon: number;
    moonrise: number | null;
    moonset: number | null;
    moonVisibleDuration: number | null;
    moonVisibleDurationFormatted: string | null;
    lunarTransit: number;
} {
    // Get sun times for the day
    const sunTimes = SunCalc.getTimes(date, latitude, longitude);
    const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);

    // Calculate day length (from sunrise to sunset)
    const dayLength = sunTimes.sunset.getTime() - sunTimes.sunrise.getTime();

    // Calculate night length (from sunset to next sunrise)
    // We need to get the next day's sunrise
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextSunTimes = SunCalc.getTimes(nextDay, latitude, longitude);
    const nightLength = nextSunTimes.sunrise.getTime() - sunTimes.sunset.getTime();

    // Calculate moon visible duration (from moonrise to moonset)
    let moonVisibleDuration: number | null = null;
    if (moonTimes.rise && moonTimes.set) {
        // Check if moonset is after moonrise
        if (moonTimes.set.getTime() > moonTimes.rise.getTime()) {
            moonVisibleDuration = moonTimes.set.getTime() - moonTimes.rise.getTime();
        } else {
            // Moonset is before moonrise, so moon is visible from moonrise to end of day
            // and from start of day to moonset - calculate total duration
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            moonVisibleDuration =
                endOfDay.getTime() - moonTimes.rise.getTime() + (moonTimes.set.getTime() - startOfDay.getTime());
        }
    }

    // Calculate lunar transit (highest point of the moon)
    const lunarTransit = calculateLunarTransit(date, latitude, longitude);

    return {
        civilDawn: sunTimes.dawn.getTime(),
        civilDusk: sunTimes.dusk.getTime(),
        nauticalDawn: sunTimes.nauticalDawn.getTime(),
        nauticalDusk: sunTimes.nauticalDusk.getTime(),
        astronomicalDawn: sunTimes.nightEnd.getTime(),
        astronomicalDusk: sunTimes.night.getTime(),
        dayLength,
        dayLengthFormatted: formatDuration(dayLength),
        nightLength,
        nightLengthFormatted: formatDuration(nightLength),
        solarNoon: sunTimes.solarNoon.getTime(),
        moonrise: moonTimes.rise ? moonTimes.rise.getTime() : null,
        moonset: moonTimes.set ? moonTimes.set.getTime() : null,
        moonVisibleDuration,
        moonVisibleDurationFormatted: moonVisibleDuration !== null ? formatDuration(moonVisibleDuration) : null,
        lunarTransit,
    };
}

/**
 * Calculate lunar transit (moon highest point) using Brent's method
 * for optimization with 1-second precision
 *
 * @param date The date for which to calculate lunar transit
 * @param latitude The latitude of the location
 * @param longitude The longitude of the location
 * @returns Timestamp of lunar transit in milliseconds
 */
function calculateLunarTransit(date: Date, latitude: number, longitude: number): number {
    // Start and end of the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Brent's method parameters
    const tolerance = 1000; // 1 second in milliseconds
    let a = dayStart.getTime();
    let b = dayEnd.getTime();

    // Objective function: negative altitude (to find maximum, we minimize negative)
    const getAltitude = (timestamp: number): number => {
        const position = SunCalc.getMoonPosition(new Date(timestamp), latitude, longitude);
        return -position.altitude; // Negative because we want to find maximum
    };

    // Golden ratio for initial search
    const phi = (1 + Math.sqrt(5)) / 2;
    const resphi = 2 - phi;

    // Initial bracket
    let x = a + resphi * (b - a);
    let fx = getAltitude(x);

    // Brent's method optimization
    while (Math.abs(b - a) > tolerance) {
        // Golden section step
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
