import fs from "fs";

export default function reloadLoggingConfigOnChange() {
  if (fs.existsSync('/etc/config/logging/LOG_LEVEL')) {
    fs.watchFile('/etc/config/logging/LOG_LEVEL', () => {
      try {
        const newLogLevel = fs.readFileSync('/etc/config/logging/LOG_LEVEL', { encoding: 'UTF-8' });
        process.env.LOG_LEVEL = newLogLevel.trim();
      } catch (error) {
        // NOOP
      }
    });
  }
}
