import _IdAndCaptcha from './_IdAndCaptcha';
import { IsDate } from 'class-validator';
import IsUndefined from '../../decorators/typeproperty/IsUndefined';

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndCaptchaAndCreatedAtTimestamp extends _IdAndCaptcha {
  @IsUndefined({ groups: ['__backk_create__', '__backk_update__'] })
  @IsDate({ groups: ['__backk_none__'] })
  createdAtTimestamp!: Date;
}
