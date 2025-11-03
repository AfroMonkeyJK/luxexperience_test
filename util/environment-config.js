import dotenv from "dotenv";
import logger from "./logger.js";

const result = dotenv.config();
if (result.error && !process.env.CI) {
  logger.error("❌ .env file not found!");
  logger.error(
    "Please create a .env file with LOGIN_USERNAME and LOGIN_PASSWORD"
  );
  throw new Error(
    "Missing .env file. Create it using .env.example as template"
  );
}

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
      emoji: "🌐",
      baseUrl: "https://pocketaces2.github.io/fashionhub/",
    },
  },

  current: (
    process.env.ENV_VARS?.toLowerCase() || Environments.PRODUCTION
  ).trim(),

  get credentials() {
    const username = process.env.LOGIN_USERNAME;
    const password = process.env.LOGIN_PASSWORD;
    if (!username) {
      logger.error("❌ LOGIN_USERNAME is not set!");
      logger.error("Add LOGIN_USERNAME to your .env file or GitHub Secrets");
      throw new Error("Missing LOGIN_USERNAME environment variable");
    }

    if (!password) {
      logger.error("❌ LOGIN_PASSWORD is not set!");
      logger.error("Add LOGIN_PASSWORD to your .env file or GitHub Secrets");
      throw new Error("Missing LOGIN_PASSWORD environment variable");
    }
    logger.debug(
      `Credentials loaded (username: ${username.substring(0, 2)}***)`
    );

    return {
      username,
      password,
    };
  },

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
      credentials: this.credentials,
    };
  },
};

export const validEnvironments = envConfig.validEnvironments;
export const isValidEnvironment = (env) => envConfig.isValidEnvironment(env);
export const getEnvironmentInfo = (env) => envConfig.getEnvironmentInfo(env);

export { envConfig };
export default envConfig;
