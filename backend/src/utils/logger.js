const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class Logger {
  static formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${level}: ${message}`;
    
    if (data) {
      return `${formattedMessage}\n${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  static info(message, data = null) {
    const formatted = this.formatMessage('INFO', message, data);
    console.log(`${colors.cyan}${formatted}${colors.reset}`);
  }

  static error(message, data = null) {
    const formatted = this.formatMessage('ERROR', message, data);
    console.error(`${colors.red}${formatted}${colors.reset}`);
  }

  static warn(message, data = null) {
    const formatted = this.formatMessage('WARN', message, data);
    console.warn(`${colors.yellow}${formatted}${colors.reset}`);
  }

  static success(message, data = null) {
    const formatted = this.formatMessage('SUCCESS', message, data);
    console.log(`${colors.green}${formatted}${colors.reset}`);
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('DEBUG', message, data);
      console.log(`${colors.dim}${formatted}${colors.reset}`);
    }
  }
}

module.exports = Logger;
