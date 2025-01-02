const isProd = process.env.NODE_ENV === 'production';

export const logger = {
  log: (...args: any[]) => {
    if (!isProd) console.log(...args);
  },
  error: (...args: any[]) => {
    if (!isProd) console.error(...args);
  },
  info: (...args: any[]) => {
    if (!isProd) console.info(...args);
  },
  warn: (...args: any[]) => {
    if (!isProd) console.warn(...args);
  }
};
