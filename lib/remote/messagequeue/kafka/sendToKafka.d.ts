export default function sendToKafka(broker: string, topic: string, key: string, message: object): Promise<[null | undefined, import("../../..").BackkError | null | undefined]>;
