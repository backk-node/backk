import _IdAndCaptcha from "../id/_IdAndCaptcha";
export default class BaseUserAccount extends _IdAndCaptcha {
    userName: string;
    displayName: string;
    password: string;
}
