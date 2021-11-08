import throwException from './exception/throwException';

export default function getDbNameFromServiceName() {
  const cwd = process.cwd();
  const serviceName = cwd.split('/').reverse()[0];
  return (
    serviceName.replace(/[-_]/g, '') + '_' + process.env.MICROSERVICE_NAMESPACE ??
    throwException('SERVICE_NAMESPACE environment variable must be defined')
  );
}
