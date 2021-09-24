import throwException from '../../../utils/exception/throwException';

export default function getKafkaServerFromEnv() {
  return (
    (process.env.KAFKA_HOST ?? throwException('KAFKA_HOST environment value must be defined')) +
    ':' +
    (process.env.KAFKA_PORT ?? throwException('KAFKA_PORT environment value must be defined'))
  );
}
