import AbstractDbManager, { One } from "../../../../AbstractDbManager";
import { BackkEntity } from "../../../../../types/entities/BackkEntity";

export default async function tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded<T extends BackkEntity>(
  dbManager: AbstractDbManager,
  currentEntity: One<T>,
  EntityClass: new () => T
) {
  if ('version' in currentEntity.data || 'lastModifiedTimestamp' in currentEntity.data) {
    const [, error] = await dbManager.updateEntity(EntityClass, {
      _id: currentEntity.data._id
    } as any);

    if (error) {
      throw error;
    }
  }
}
