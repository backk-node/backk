export default function getControllerService<T extends object>(
  controller: any,
  ServiceClass: new () => T
): any {
  return Object.values(controller).find((service) => service instanceof ServiceClass);
}
