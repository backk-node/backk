import { logLevel } from "kafkajs";

const minimumLoggingSeverityToKafkaLoggingLevelMap: { [key: string]: number } = {
  DEBUG: logLevel.DEBUG,
  INFO: logLevel.INFO,
  WARN: logLevel.WARN,
  ERROR: logLevel.ERROR
};

export default minimumLoggingSeverityToKafkaLoggingLevelMap;
