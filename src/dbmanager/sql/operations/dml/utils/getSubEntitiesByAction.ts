export default function getSubEntitiesByAction<T extends { id: string }>(
  newSubEntities: T[],
  currentSubEntities: T[]
) {
  const subEntitiesToDelete = currentSubEntities.filter(
    (currentSubEntity) => !newSubEntities.some((newSubEntity) => currentSubEntity.id === newSubEntity.id)
  );

  const subEntitiesToAdd = newSubEntities.filter(
    (newSubEntity) => !currentSubEntities.some((currentSubEntity) => currentSubEntity.id === newSubEntity.id)
  );

  const subEntitiesToUpdate = newSubEntities.filter((newSubEntity) =>
    currentSubEntities.some((currentSubEntity) => currentSubEntity.id === newSubEntity.id)
  );

  return {
    subEntitiesToAdd,
    subEntitiesToDelete,
    subEntitiesToUpdate
  }
}
