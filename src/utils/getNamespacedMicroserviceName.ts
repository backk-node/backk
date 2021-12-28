import getMicroserviceName from "./getMicroserviceName";

export default function getNamespacedMicroserviceName(): string {
  if (!process.env.MICROSERVICE_NAMESPACE) {
    throw new Error('MICROSERVICE_NAMESPACE environment variable must be defined');
  }

  return getMicroserviceName() + '.' + process.env.MICROSERVICE_NAMESPACE;
}
