import _IdAndCaptcha from './_IdAndCaptcha';
import { Max, Min } from 'class-validator';
import IsUndefined from '../../decorators/typeproperty/IsUndefined';
import IsBigInt from '../../decorators/typeproperty/IsBigInt';
import NotUnique from "../../decorators/typeproperty/NotUnique";
import ReadUpdate from "../../decorators/typeproperty/access/ReadUpdate";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndCaptchaAndVersion extends _IdAndCaptcha {
  @IsUndefined({ groups: ['__backk_create__'] })
  @IsBigInt({ groups: ['__backk_none__'] })
  @Min(-1)
  @NotUnique()
  @Max(Number.MAX_SAFE_INTEGER)
  @ReadUpdate()
  version!: number;
}
