import getServiceName from "./getServiceName";

export default function getNamespacedServiceName(): string {
  if (!process.env.SERVICE_NAMESPACE) {
    throw new Error('SERVICE_NAMESPACE environment variable must be defined');
  }

  return getServiceName() + '.' + process.env.SERVICE_NAMESPACE;
}
