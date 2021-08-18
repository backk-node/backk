import AbstractDataStore, { One } from "../../../../AbstractDataStore";
import { BackkEntity } from "../../../../../types/entities/BackkEntity";

export default async function tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded<T extends BackkEntity>(
  dataStore: AbstractDataStore,
  currentEntity: One<T>,
  EntityClass: new () => T
) {
  if ('version' in currentEntity.data || 'lastModifiedTimestamp' in currentEntity.data) {
    const [, error] = await dataStore.updateEntity(EntityClass, {
      _id: currentEntity.data._id
    } as any);

    if (error) {
      throw error;
    }
  }
}
