// Re-export configuration for backward compatibility
// Use the new config.ts for all environment configuration
export { config as env, ENV_MODE, type EnvMode, getEnvMode } from "./lib/config";
