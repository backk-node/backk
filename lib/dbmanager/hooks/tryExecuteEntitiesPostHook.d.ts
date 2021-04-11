import { BackkEntity } from "../../types/entities/BackkEntity";
import { SubEntity } from "../../types/entities/SubEntity";
import { EntitiesPostHook } from "./EntitiesPostHook";
export default function tryExecuteEntitiesPostHook<T extends BackkEntity | SubEntity>(postHook: EntitiesPostHook<T>, entities: T[] | null | undefined): Promise<void>;
