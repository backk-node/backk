import IsUndefined from "../decorators/typeproperty/IsUndefined";
import { Max, Min } from "class-validator";
import IsBigInt from "../decorators/typeproperty/IsBigInt";
import NotUnique from "../decorators/typeproperty/NotUnique";
import ReadUpdate from "../decorators/typeproperty/access/ReadUpdate";

export default class Version {
  @IsUndefined({groups: ['__backk_create__']})
  @IsBigInt({ groups: ['__backk_none__'] })
  @NotUnique()
  @Min(-1)
  @Max(Number.MAX_SAFE_INTEGER)
  @ReadUpdate()
  version!: number;
}
