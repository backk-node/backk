export default function getMicroserviceServiceByServiceClass(
  microservice: any,
  ServiceClass: Function
): any  {
  const services = Object.values(microservice).filter((service) => service instanceof ServiceClass);
  if (services.length > 1) {
    throw new Error('There can be only one instance of class ' + ServiceClass.name + ' in your microservice')
  }
  return services[0];
}
