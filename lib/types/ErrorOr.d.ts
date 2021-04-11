import { BackkError } from "./BackkError";
export declare type ErrorOr<T> = [T | null | undefined, BackkError | null | undefined];
