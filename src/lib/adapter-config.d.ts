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
            "units": "si" | "us" | "ca" | "uk";
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export { };