import Microservice from '../microservice/Microservice';
import { RequestProcessor } from './RequestProcessor';
import { CommunicationMethod } from "../remote/messagequeue/sendToRemoteService";

export default abstract class AbstractAsyncRequestProcessor implements RequestProcessor {
  isAsyncProcessor(): boolean {
    return true;
  }

  abstract getCommunicationMethod(): CommunicationMethod;
  abstract startProcessingRequests(microservice: Microservice): void;
}
