import { BackkError } from "./BackkError";

export type ErrorOr<T> = [T | null | undefined, BackkError | null | undefined];
