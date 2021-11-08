import { IsAscii, IsString, MaxLength } from 'class-validator';
import _Id from './_Id';
import Transient from '../../decorators/typeproperty/Transient';
import { Lengths } from '../../constants/constants';
import IsUndefined from "../../decorators/typeproperty/IsUndefined";
import CreateOnly from "../../decorators/typeproperty/access/CreateOnly";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class _IdAndCaptcha extends _Id {
  @IsUndefined({ groups: ['__backk_update__'] })
  @CreateOnly()
  @Transient()
  @IsString()
  @MaxLength(Lengths._512)
  @IsAscii()
  captchaToken!: string;
}
