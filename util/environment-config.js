import dotenv from "dotenv";
import logger from "./logger.js";
dotenv.config();

/**
 * Environment constants for FashionHub
 */
export const Environments = {
  LOCAL: "local",
  STAGING: "staging",
  PRODUCTION: "production",
};

/**
 * Comprehensive environment configuration
 */
const envConfig = {
  environments: {
    [Environments.LOCAL]: "local",
    [Environments.STAGING]: "staging",
    [Environments.PRODUCTION]: "production",
  },

  environmentInfo: {
    [Environments.LOCAL]: {
      name: "Local Development",
      emoji: "🔧",
      baseUrl: "http://localhost:4000/fashionhub/",
    },
    [Environments.STAGING]: {
      name: "Staging Environment",
      emoji: "🚧",
      baseUrl: "https://staging-env/fashionhub/",
    },
    [Environments.PRODUCTION]: {
      name: "Production",
      emoji: "🌍",
      baseUrl: "https://pocketaces2.github.io/fashionhub/",
    },
  },

  current: (
    process.env.ENV_VARS?.toLowerCase() || Environments.PRODUCTION
  ).trim(),

  get prefix() {
    const selectedPrefix =
      this.environments[this.current] ||
      this.environments[Environments.PRODUCTION];
    return selectedPrefix;
  },

  get baseUrl() {
    const envInfo = this.getEnvironmentInfo(this.current);
    logger.info(
      `${envInfo.emoji} Running tests on ${
        envInfo.name
      } environment: ${this.current.toUpperCase()}`
    );
    return envInfo.baseUrl;
  },

  getEnvironmentInfo(env) {
    return (
      this.environmentInfo[env] || {
        name: env,
        emoji: "❓",
        baseUrl: this.environmentInfo[Environments.PRODUCTION].baseUrl,
      }
    );
  },

  isValidEnvironment(env) {
    return Object.values(Environments).includes(env);
  },

  get validEnvironments() {
    return Object.values(Environments);
  },

  setEnvironment(env) {
    if (!this.isValidEnvironment(env)) {
      throw new Error(
        `Invalid environment: ${env}. Valid options: ${this.validEnvironments.join(
          ", "
        )}`
      );
    }
    this.current = env;
    logger.info(
      `🔄 Environment changed to: ${this.getEnvironmentInfo(env).name} (${env})`
    );
  },

  getConfig(env = this.current) {
    if (!this.isValidEnvironment(env)) {
      throw new Error(`Invalid environment: ${env}`);
    }
    const info = this.getEnvironmentInfo(env);
    return {
      environment: env,
      prefix: this.environments[env],
      baseUrl: info.baseUrl,
      info: info,
    };
  },
};

export const validEnvironments = envConfig.validEnvironments;
export const isValidEnvironment = (env) => envConfig.isValidEnvironment(env);
export const getEnvironmentInfo = (env) => envConfig.getEnvironmentInfo(env);

export { envConfig };
export default envConfig;
