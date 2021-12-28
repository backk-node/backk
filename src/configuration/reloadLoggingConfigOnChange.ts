import fs from "fs";

export default function reloadLoggingConfigOnChange() {
  if (fs.existsSync('/etc/config/LOG_LEVEL')) {
    try {
      const logLevel = fs.readFileSync('/etc/config/LOG_LEVEL', { encoding: 'UTF-8' });
      process.env.LOG_LEVEL = logLevel.trim();
    } catch (error) {
      // NOOP
    }

    fs.watchFile('/etc/config/LOG_LEVEL', () => {
      try {
        const newLogLevel = fs.readFileSync('/etc/config/LOG_LEVEL', { encoding: 'UTF-8' });
        process.env.LOG_LEVEL = newLogLevel.trim();
      } catch (error) {
        // NOOP
      }
    });
  }
}
