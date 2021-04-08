import sendToRemoteService from "../sendToRemoteService";

export default async function sendToKafka(broker: string, topic: string, key: string, message: object) {
  const remoteServiceUrl = 'kafka://' + broker + '/' + topic + '/' + key;
  return await sendToRemoteService(remoteServiceUrl, message);
}
