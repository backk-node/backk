import _IdAndCaptchaAndCreatedAtTimestamp from "./_IdAndCaptchaAndCreatedAtTimestamp";
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import { IsDate } from "class-validator";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndCaptchaAndCreatedAtTimestampAndLastModifiedTimestamp extends _IdAndCaptchaAndCreatedAtTimestamp {
  @IsUndefined({groups: ['__backk_create__']})
  @IsDate({ groups: ['__backk_none__'] })
  public lastModifiedTimestamp!: Date;
}
