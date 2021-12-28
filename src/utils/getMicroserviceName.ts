export default function getMicroserviceName(): string {
  if (process.env.MICROSERVICE_NAME) {
    return process.env.MICROSERVICE_NAME;
  }

  const cwd = process.cwd();
  return cwd.split('/').reverse()[0];
}
