export default function removeSubEntities(entity: any, subEntities: any[]) {
  Object.entries(entity).forEach(([propertyName, propertyValueOrValues]: [string, any]) => {
    if (
      Array.isArray(propertyValueOrValues) &&
      propertyValueOrValues.length > 0
    ) {
      entity[propertyName] = propertyValueOrValues.filter(
        (propertyValue) => !subEntities.find((subEntity) => subEntity === propertyValue)
      );
    }

    if (typeof propertyValueOrValues === 'object' && propertyValueOrValues !== null) {
      if (
        Array.isArray(propertyValueOrValues) &&
        propertyValueOrValues.length > 0 &&
        typeof propertyValueOrValues[0] === 'object'
      ) {
        propertyValueOrValues.forEach((propertyValue) => removeSubEntities(propertyValue, subEntities));
      } else {
        removeSubEntities(propertyValueOrValues, subEntities);
      }
    }
  });
}
