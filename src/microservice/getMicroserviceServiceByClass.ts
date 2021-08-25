export default function getMicroserviceServiceByClass<T extends object>(
  microservice: any,
  ServiceClass: new () => T
): any {
  return Object.values(microservice).find((service) => service instanceof ServiceClass);
}
