import Microservice from "../microservice/Microservice";

export interface RequestProcessor {
  startProcessingRequests(microservice: Microservice): void
}
