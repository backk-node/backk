import throwException from '../../../utils/exception/throwException';

export default function getRedisServerFromEnv() {
  return (
    (process.env.REDIS_HOST ?? throwException('REDIS_HOST environment value must be defined')) +
    ':' +
    (process.env.REEDIS_PORT ?? throwException('REDIS_PORT environment value must be defined'))
  );
}
