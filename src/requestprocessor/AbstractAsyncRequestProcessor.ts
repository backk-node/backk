import Microservice from '../microservice/Microservice';
import { CommunicationMethod } from '../remote/messagequeue/sendToRemoteService';
import { RequestProcessor } from './RequestProcessor';

export default abstract class AbstractAsyncRequestProcessor implements RequestProcessor {
  isAsyncProcessor(): boolean {
    return true;
  }

  abstract getCommunicationMethod(): CommunicationMethod;
  abstract startProcessingRequests(microservice: Microservice): void;
}
