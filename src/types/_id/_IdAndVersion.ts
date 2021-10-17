import _Id from "./_Id";
import { Max, Min } from "class-validator";
import { BackkEntity } from "../entities/BackkEntity";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import IsBigInt from "../../decorators/typeproperty/IsBigInt";
import NotUnique from "../../decorators/typeproperty/NotUnique";
import ReadUpdate from "../../decorators/typeproperty/access/ReadUpdate";

// eslint-disable-next-line @typescript-eslint/class-value-casing
export default class _IdAndVersion extends _Id implements BackkEntity {
  @IsUndefined({ groups: ['__backk_create__'] })
  @IsBigInt({ groups: ['__backk_none__'] })
  @NotUnique()
  @Min(-1)
  @Max(Number.MAX_SAFE_INTEGER)
  @ReadUpdate()
  version!: number;
}
