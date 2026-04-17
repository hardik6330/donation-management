const logger = {
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  info: (...args) => console.log(...args),
  http: (...args) => console.log(...args),
  debug: (...args) => console.debug(...args),
};

logger.stream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
