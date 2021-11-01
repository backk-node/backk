import Microservice from "../microservice/Microservice";
import { CommunicationMethod } from "../remote/messagequeue/sendToRemoteService";

export interface RequestProcessor {
  getCommunicationMethod(): CommunicationMethod
  isAsyncProcessor(): boolean;
  startProcessingRequests(microservice: Microservice): void
}
