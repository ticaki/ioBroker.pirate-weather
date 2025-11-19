// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        interface AdapterConfig {
            "apiToken": "string",
            "position": string,
            "pollInterval": number,
            "minutes": boolean | undefined,
            "hours": number,
            "pollingInMinutes": boolean,
            "pollIntervalMinutes": number,
            "units": "si" | "us" | "ca" | "uk";
            dayNightEnabled: boolean;
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export { };