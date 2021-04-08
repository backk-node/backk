import getServiceName from "./getServiceName";

export default function getNamespacedServiceName(): string {
  if (!process.env.SERVICE_NAMESPACE) {
    throw new Error('Environment variable SERVICE_NAMESPACE must be defined');
  }

  return getServiceName() + '.' + process.env.SERVICE_NAMESPACE;
}
