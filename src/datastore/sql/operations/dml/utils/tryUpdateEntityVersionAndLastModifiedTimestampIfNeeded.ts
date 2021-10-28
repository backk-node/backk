import DataStore, { One } from "../../../../DataStore";
import { BackkEntity } from "../../../../../types/entities/BackkEntity";
import throwIf from "../../../../../utils/exception/throwIf";

export default async function tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded<T extends BackkEntity>(
  dataStore: DataStore,
  currentEntity: One<T>,
  EntityClass: new () => T
) {
  if ('version' in currentEntity.data || 'lastModifiedTimestamp' in currentEntity.data) {
    const [, error] = await dataStore.updateEntity(EntityClass, {
      _id: currentEntity.data._id
    } as any);

    throwIf(error);
  }
}
