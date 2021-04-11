import AbstractDbManager from "../../../../AbstractDbManager";
import { BackkEntity } from "../../../../../types/entities/BackkEntity";
export default function tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded<T extends BackkEntity>(dbManager: AbstractDbManager, currentEntity: T, EntityClass: new () => T): Promise<void>;
