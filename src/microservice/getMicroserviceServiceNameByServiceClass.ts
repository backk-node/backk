export default function getMicroserviceServiceNameByServiceClass(
  microservice: any,
  ServiceClass: Function
): string  {
  const service = Object.entries(microservice).find(([, service]) => service instanceof ServiceClass);
  if (service) {
    return service[0];
  }

  return 'Service value not found';
}
