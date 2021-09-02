export default function getMicroserviceServiceByClass(
  microservice: any,
  ServiceClass: Function
): any {
  return Object.values(microservice).find((service) => service instanceof ServiceClass);
}
