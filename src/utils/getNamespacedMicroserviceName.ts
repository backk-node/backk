import getMicroserviceName from "./getMicroserviceName";

export default function getNamespacedMicroserviceName(): string {
  if (!process.env.SERVICE_NAMESPACE) {
    throw new Error('SERVICE_NAMESPACE environment variable must be defined');
  }

  return getMicroserviceName() + '.' + process.env.SERVICE_NAMESPACE;
}
