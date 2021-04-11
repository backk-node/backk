import { BackkError } from "../types/BackkError";
export default function fetchFromRemoteServices(Type: new () => any, serviceFunctionArgument: any, response: any, types: any, responsePath?: string): Promise<BackkError | null>;
