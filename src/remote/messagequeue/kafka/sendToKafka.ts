import sendToRemoteService from '../sendToRemoteService';

export default async function sendToKafka(broker: string, topic: string, key: string, message: object) {
  return await sendToRemoteService('kafka', broker, key, message);
}
