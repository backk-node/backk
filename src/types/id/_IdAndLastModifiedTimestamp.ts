import _Id from "./_Id";
import { BackkEntity } from "../entities/BackkEntity";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import { IsDate } from "class-validator";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndLastModifiedTimestamp extends _Id implements BackkEntity {
  @IsUndefined({groups: ['__backk_create__']})
  @IsDate({ groups: ['__backk_none__'] })
  readonly lastModifiedTimestamp!: Date;
}
