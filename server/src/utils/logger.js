import { env } from '../config/env.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = env.nodeEnv === 'production' ? LEVELS.warn : LEVELS.debug;

const timestamp = () => new Date().toISOString();

const fmt = (level, message, meta) => {
    const base = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
    return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

export const logger = {
    error: (message, meta) => {
        if (currentLevel >= LEVELS.error) console.error(fmt('error', message, meta));
    },
    warn: (message, meta) => {
        if (currentLevel >= LEVELS.warn) console.warn(fmt('warn', message, meta));
    },
    info: (message, meta) => {
        if (currentLevel >= LEVELS.info) console.info(fmt('info', message, meta));
    },
    debug: (message, meta) => {
        if (currentLevel >= LEVELS.debug) console.debug(fmt('debug', message, meta));
    },
};
